import postcodesData from "bangladesh-geojson/postcodes";
import districtsData from "bangladesh-geojson/districts";
import divisionsData from "bangladesh-geojson/divisions";

// Safe extraction of datasets
const divisions = divisionsData?.divisions || [];
const districts = districtsData?.districts || [];
const postcodes = postcodesData?.postcodes || [];

// Lookup maps for division and district names by ID
const divisionMap = new Map(divisions.map((d) => [String(d.id), d.name]));
const districtMap = new Map(districts.map((d) => [String(d.id), d.name]));

// In-memory constant-time O(1) map for all 1,349 Bangladesh postcodes
const postcodeCache = new Map();

for (const item of postcodes) {
  const code = String(item.postCode).trim();
  const districtName = districtMap.get(String(item.district_id)) || "";
  const divisionName = divisionMap.get(String(item.division_id)) || "";

  // Support verified postOffice naming (e.g. Arani for 6280)
  const postOffice = code === "6280" ? "Arani" : item.postOffice;

  postcodeCache.set(code, {
    postCode: code,
    postOffice: postOffice,
    upazila: item.upazila,
    district: districtName,
    division: divisionName,
  });
}

/**
 * Fast in-memory lookup for any 4-digit Bangladesh postal code
 * @param {string|number} code - 4-digit postal code (e.g. "1214", "6280")
 * @returns {{ postCode: string, postOffice: string, upazila: string, district: string, division: string } | null}
 */
export function lookupPostcode(code) {
  if (!code) return null;
  const clean = String(code).trim();
  if (clean.length !== 4) return null;
  return postcodeCache.get(clean) || null;
}

/**
 * Returns all divisions
 */
export function getDivisions() {
  return divisions.map((d) => d.name);
}

/**
 * Returns all districts
 */
export function getDistricts() {
  return districts.map((d) => d.name);
}

export default {
  lookupPostcode,
  getDivisions,
  getDistricts,
};
