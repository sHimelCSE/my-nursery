import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import bcrypt from "bcryptjs";
import dbConnect from "@/lib/dbConnect";
import User from "@/models/User";

export const authOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "placeholder_google_client_id",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "placeholder_google_client_secret",
      allowDangerousEmailAccountLinking: true,
    }),
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        identifier: { label: "Email or Phone", type: "text" },
        email: { label: "Email or Phone", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const rawIdentifier = credentials?.identifier || credentials?.email;
        if (!rawIdentifier || !credentials?.password) {
          throw new Error("Please enter your email or phone number and password");
        }

        await dbConnect();

        const input = rawIdentifier.trim();
        const cleanEmail = input.toLowerCase();
        const cleanPhone = input.replace(/[\s-]/g, "");

        // Find user by Email OR Phone Number
        const user = await User.findOne({
          $or: [
            { email: cleanEmail },
            { phone: cleanPhone },
            { phone: input },
          ],
        }).select("+password");

        if (!user) {
          throw new Error("No account found with this email or phone number");
        }

        const isMatch = await bcrypt.compare(credentials.password, user.password);
        if (!isMatch) {
          throw new Error("Invalid password");
        }

        return {
          id: user._id.toString(),
          name: user.name,
          email: user.email,
          phone: user.phone || "",
          image: user.image || user.avatar || "",
          role: user.role || "user",
        };
      },
    }),
  ],
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  callbacks: {
    async signIn({ user, account, profile }) {
      if (account?.provider === "google") {
        await dbConnect();
        const email = (user.email || profile?.email || "").toLowerCase().trim();
        if (!email) return false;

        let dbUser = await User.findOne({ email });
        if (!dbUser) {
          dbUser = await User.create({
            name: user.name || profile?.name || "Customer",
            email: email,
            image: user.image || profile?.picture || "",
            avatar: user.image || profile?.picture || "",
            role: "user",
          });
        } else {
          // Update avatar image if available and not set
          if (!dbUser.image && (user.image || profile?.picture)) {
            dbUser.image = user.image || profile?.picture;
            dbUser.avatar = user.image || profile?.picture;
            await dbUser.save();
          }
        }
        user.id = dbUser._id.toString();
        user.role = dbUser.role || "user";
      }
      return true;
    },
    async jwt({ token, user, account, profile }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.phone = user.phone;
        token.picture = user.image || user.avatar || token.picture;
      }

      // If user logs in via Google and id or role is missing in token
      if (token?.email && (!token.id || !token.role)) {
        await dbConnect();
        const dbUser = await User.findOne({ email: token.email.toLowerCase() });
        if (dbUser) {
          token.id = dbUser._id.toString();
          token.role = dbUser.role || "user";
          token.phone = dbUser.phone || "";
          token.picture = dbUser.image || dbUser.avatar || token.picture;
        }
      }

      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id;
        session.user.role = token.role;
        session.user.phone = token.phone;
        session.user.image = token.picture || session.user.image;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
  secret: process.env.NEXTAUTH_SECRET || "greenleaf_nursery_secret_key_super_secure_2026_jwt_token",
};
