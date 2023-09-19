import { CoordinateSystems } from "../components/CoordinateSystems.js";

export const convertCoordinates = (
  selectedCoordinateSystem,
  latitude,
  Longitude
) => {
  console.log(latitude.value, Longitude.value, selectedCoordinateSystem.value);
  if (
    !isValidCoordinate(parseFloat(latitude.value)) ||
    !isValidCoordinate(parseFloat(Longitude.value))
  ) {
    return;
  }
  let formattedCoordinates;
  if (selectedCoordinateSystem.value === CoordinateSystems.GEO_DMS) {
    const latitudeDMS = convertToDMS(parseFloat(latitude.value), "lat");
    const longitudeDMS = convertToDMS(parseFloat(Longitude.value), "long");

    formattedCoordinates = `${latitudeDMS},  ${longitudeDMS}`;
  } else if (selectedCoordinateSystem.value === CoordinateSystems.GEO_DD) {
    // Convert latitude and longitude to GEO DD format
    formattedCoordinates = ` ${latitude}N, ${Longitude}E`;
  } else if (selectedCoordinateSystem.value === CoordinateSystems.GEO_DDM) {
    formattedCoordinates = `Latitude (DDM): ${convertToDDM(
      parseFloat(latitude.value)
    )}, Longitude (DDM): ${convertToDDM(Longitude.value)}`;
  } else if (selectedCoordinateSystem.value === CoordinateSystems.UTM) {
    const utm = utmConversion(latitude.value, Longitude.value);
    formattedCoordinates = `UTM Coordinates: ${utm.easting}, ${utm.northing}, Zone ${utm.zoneNumber}${utm.hemisphere} `;
  } else if (selectedCoordinateSystem.value === CoordinateSystems.MGRS) {
    const mgrs = convertToMGRS(latitude.value, Longitude.value);
    console.log(`MGRS Coordinates: ${mgrs}`);
    formattedCoordinates = mgrs;
  } else if (selectedCoordinateSystem.value === CoordinateSystems.GK) {
    // Convert latitude and longitude to GEO DD format
    const gkCoordinates = convertToGK(latitude.value, Longitude.value);
    formattedCoordinates = gkCoordinates;
  } else if (selectedCoordinateSystem.value === CoordinateSystems.KERTUA) {
    const kertau = convertToKertau(latitude.value, Longitude.value);
    formattedCoordinates = kertau;
  } else {
    formattedCoordinates = "Invalid coordinates";
  }

  console.log(formattedCoordinates);
  return formattedCoordinates;
};

export const isValidCoordinate = (value) => {
  return !isNaN(value) && value >= -90 && value <= 90;
};

export const convertToDMS = (value, type) => {
  const degrees = Math.floor(value);
  const minutes = Math.floor((value - degrees) * 60);
  const seconds = ((value - degrees - minutes / 60) * 3600).toFixed(2);

  let direction =
    type === "lat" ? (value < 0 ? "S" : "N") : value < 0 ? "W" : "E";

  return `${Math.abs(degrees)}° ${minutes}' ${seconds}" ${direction}`;
};
export const convertToDDM = (value) => {
  const degrees = Math.floor(value);
  const minutes = ((value - degrees) * 60).toFixed(2);

  return `${degrees}° ${minutes}'`;
};

export const convertToMGRS = (latitude, longitude) => {
  if (latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180) {
    return "Invalid input";
  }

  const zone = Math.floor((longitude + 180) / 6) + 1; // Determine the UTM zone
  const isNorthernHemisphere = latitude >= 0;
  const hemisphere = isNorthernHemisphere ? "N" : "S";

  // Convert latitude to radians
  const latRad = latitude * (Math.PI / 180);

  // Constants for MGRS conversion
  const a = 6378137; // Equatorial radius in meters
  const f = 1 / 298.257223563; // Flattening
  const k0 = 0.9996; // Scale factor
  const b = a * (1 - f); // Polar radius
  const eSquared = 1 - (b * b) / (a * a); // Eccentricity squared
  const ePrimeSquared = eSquared / (1 - eSquared); // Second eccentricity squared
  const N = a / Math.sqrt(1 - eSquared * Math.sin(latRad) ** 2); // Radius of curvature of the prime vertical

  // Calculate variables used in MGRS conversion
  const A = (a / (1 + n)) * (1 + Math.pow(n, 2) / 4 + Math.pow(n, 4) / 64);
  const T = Math.pow(Math.tan(latRad), 2);
  const C = ePrimeSquared * Math.pow(Math.cos(latRad), 2);
  const L = (longitude - ((zone - 1) * 6 - 180)) * (Math.PI / 180);
  const M =
    a *
    ((1 -
      eSquared / 4 -
      (3 * Math.pow(eSquared, 2)) / 64 -
      (5 * Math.pow(eSquared, 3)) / 256) *
      latRad -
      ((3 * eSquared) / 8 +
        (3 * Math.pow(eSquared, 2)) / 32 +
        (45 * Math.pow(eSquared, 3)) / 1024) *
        Math.sin(2 * latRad) +
      ((15 * Math.pow(eSquared, 2)) / 256 +
        (45 * Math.pow(eSquared, 3)) / 1024) *
        Math.sin(4 * latRad) -
      ((35 * Math.pow(eSquared, 3)) / 3072) * Math.sin(6 * latRad));

  // Calculate the MGRS coordinates
  const easting =
    k0 *
    N *
    (L +
      (L ** 3 / 6) * (1 - T + C) +
      (L ** 5 / 120) * (5 - 18 * T + T ** 2 + 72 * C - 58 * ePrimeSquared));
  let northing =
    k0 *
    (M -
      M0 +
      N *
        Math.tan(latRad) *
        (L ** 2 / 2 + (L ** 4 / 24) * (5 - T + 9 * C + 4 * C ** 2)));
  northing = isNorthernHemisphere ? northing : northing + 10000000; // Adjust for southern hemisphere

  // Round the easting and northing to the nearest 1 meter
  easting = Math.round(easting);
  northing = Math.round(northing);

  return `${zone}${hemisphere} ${easting} ${northing}`;
};

export const degToRad = (deg) => {
  return deg * (Math.PI / 180);
};

export const utmConversion = (latitude, longitude) => {
  const a = 6378137; // Equatorial radius in meters
  const f = 1 / 298.257223563; // Flattening
  const k0 = 0.9996; // UTM scale factor
  const zoneWidth = 6; // Width of UTM zone in degrees

  // Determine the UTM zone
  const zoneNumber = Math.floor((longitude + 180) / zoneWidth) + 1;

  // Convert latitude and longitude to radians
  const latRad = degToRad(latitude);
  const lonRad = degToRad(longitude);

  // Compute UTM constants
  const e2 = 2 * f - f * f;
  const n = (a - 6356752.3142) / (a + 6356752.3142);
  const A = (a / (1 + n)) * (1 + Math.pow(n, 2) / 4 + Math.pow(n, 4) / 64);
  const alpha = [
    null,
    (1 / 2) * n - (2 / 3) * Math.pow(n, 2) + (5 / 16) * Math.pow(n, 3),
    (13 / 48) * Math.pow(n, 2) - (3 / 5) * Math.pow(n, 3),
    (61 / 240) * Math.pow(n, 3),
  ];

  // Compute UTM coordinates
  const N = A / Math.sqrt(1 - e2 * Math.pow(Math.sin(latRad), 2));
  const T = Math.pow(Math.tan(latRad), 2);
  const C = e2 * Math.pow(Math.cos(latRad), 2);
  const L = lonRad - degToRad((zoneNumber - 1) * zoneWidth - 180);
  const M =
    a *
    ((1 - e2 / 4 - (3 * e2 * e2) / 64 - (5 * e2 * e2 * e2) / 256) * latRad -
      ((3 * e2) / 8 + (3 * e2 * e2) / 32 + (45 * e2 * e2 * e2) / 1024) *
        Math.sin(2 * latRad) +
      ((15 * e2 * e2) / 256 + (45 * e2 * e2 * e2) / 1024) *
        Math.sin(4 * latRad) -
      ((35 * e2 * e2 * e2) / 3072) * Math.sin(6 * latRad));

  const x =
    k0 *
    N *
    (L +
      ((1 - T + C) * Math.pow(L, 3)) / 6 +
      ((5 - 18 * T + T * T + 72 * C - 58 * e2) * Math.pow(L, 5)) / 120);
  const y =
    k0 *
    (M +
      N *
        Math.tan(latRad) *
        ((L * L) / 2 +
          ((5 - T + 9 * C + 4 * C * C) * Math.pow(L, 4)) / 24 +
          ((61 - 58 * T + T * T + 600 * C - 330 * e2) * Math.pow(L, 6)) / 720));
  let hemisphere;
  if (latitude > 0) hemisphere = "N";
  else hemisphere = "S";

  return { easting: x, northing: y, zoneNumber, hemisphere: hemisphere };
};

export const convertToGK = (latitude, longitude) => {
  if (latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180) {
    return "Invalid input";
  }

  const zoneNumber = Math.floor((longitude + 180) / 3) + 1; // Determine the GK zone

  // Constants for GK conversion (These values are for the Bessel 1841 ellipsoid)
  const a = 6377397.155; // Semi-major axis
  const f = 1 / 299.1528128; // Flattening
  const eSquared = 2 * f - f * f; // Eccentricity squared
  const ePrimeSquared = eSquared / (1 - eSquared); // Second eccentricity squared

  // Convert latitude to radians
  const latRad = (latitude * Math.PI) / 180;

  // Calculate constants for GK conversion
  const n = f / (2 - f); // Third flattening
  const cosLat = Math.cos(latRad);
  const sinLat = Math.sin(latRad);

  // Calculate the meridian radius of curvature
  const M =
    a *
    ((1 -
      eSquared / 4 -
      (3 * eSquared * eSquared) / 64 -
      (5 * eSquared * eSquared * eSquared) / 256) *
      latRad -
      ((3 * eSquared) / 8 +
        (3 * eSquared * eSquared) / 32 +
        (45 * eSquared * eSquared * eSquared) / 1024) *
        Math.sin(2 * latRad) +
      ((15 * eSquared * eSquared) / 256 +
        (45 * eSquared * eSquared * eSquared) / 1024) *
        Math.sin(4 * latRad) -
      ((35 * eSquared * eSquared * eSquared) / 3072) * Math.sin(6 * latRad));

  // Calculate the transverse radius of curvature
  const nu = a / Math.sqrt(1 - eSquared * sinLat * sinLat);

  // Calculate the GK coordinates
  const A = eSquared / 2 + ((5 * eSquared * eSquared) / 24) * sinLat * sinLat;
  const B =
    ((7 * eSquared * eSquared) / 48) * sinLat * sinLat * sinLat * sinLat;
  const C =
    ((7 * eSquared * eSquared * eSquared) / 120) *
    sinLat *
    sinLat *
    sinLat *
    sinLat *
    sinLat *
    sinLat;

  const easting =
    500000 + (nu * cosLat * (longitude - (zoneNumber - 1) * 3)) / Math.PI;
  const northing =
    M +
    (nu *
      sinLat *
      (1 +
        A * (longitude - (zoneNumber - 1) * 3) ** 2 +
        B * (longitude - (zoneNumber - 1) * 3) ** 4 +
        C * (longitude - (zoneNumber - 1) * 3) ** 6)) /
      Math.PI;

  return `GK Coordinates (Zone ${zoneNumber}):  ${easting}E  ${northing}N`;
};

export const convertToKertau = (latitude, longitude) => {
  if (latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180) {
    return "Invalid input";
  }

  // Constants for Kertau conversion (These values are for the Kertau 1968 ellipsoid)
  const a = 6378388; // Semi-major axis in meters
  const f = 1 / 297; // Flattening
  const eSquared = 2 * f - f * f; // Eccentricity squared

  // Convert latitude and longitude to radians
  const latRad = (latitude * Math.PI) / 180;
  const lonRad = (longitude * Math.PI) / 180;

  // Constants for Kertau projection
  const k0 = 0.99975; // Scale factor
  const lon0 = 102 * (Math.PI / 180); // Central meridian for Kertau (in radians)
  const falseEasting = 550000; // False easting in meters
  const falseNorthing = 0; // False northing in meters

  // Calculate the meridian distance
  const M =
    a *
    ((1 -
      eSquared / 4 -
      (3 * eSquared * eSquared) / 64 -
      (5 * eSquared * eSquared * eSquared) / 256) *
      latRad -
      ((3 * eSquared) / 8 +
        (3 * eSquared * eSquared) / 32 +
        (45 * eSquared * eSquared * eSquared) / 1024) *
        Math.sin(2 * latRad) +
      ((15 * eSquared * eSquared) / 256 +
        (45 * eSquared * eSquared * eSquared) / 1024) *
        Math.sin(4 * latRad) -
      ((35 * eSquared * eSquared * eSquared) / 3072) * Math.sin(6 * latRad));

  // Calculate the easting and northing
  const N = a / Math.sqrt(1 - eSquared * Math.sin(latRad) * Math.sin(latRad));
  const T = Math.tan(latRad) * Math.tan(latRad);
  const C = eSquared * Math.cos(latRad) * Math.cos(latRad);
  const A = (lonRad - lon0) * Math.cos(latRad);
  const M0 =
    a *
    ((1 -
      eSquared / 4 -
      (3 * eSquared * eSquared) / 64 -
      (5 * eSquared * eSquared * eSquared) / 256) *
      0 -
      ((3 * eSquared) / 8 +
        (3 * eSquared * eSquared) / 32 +
        (45 * eSquared * eSquared * eSquared) / 1024) *
        Math.sin(2 * 0) +
      ((15 * eSquared * eSquared) / 256 +
        (45 * eSquared * eSquared * eSquared) / 1024) *
        Math.sin(4 * 0) -
      ((35 * eSquared * eSquared * eSquared) / 3072) * Math.sin(6 * 0));

  const easting =
    k0 *
      N *
      (A +
        ((1 - T + C) * A ** 3) / 6 +
        ((5 - 18 * T + T ** 2 + 72 * C - 58 * eSquared) * A ** 5) / 120) +
    falseEasting;
  const northing =
    k0 *
      (M -
        M0 +
        N *
          Math.tan(latRad) *
          (A ** 2 / 2 + ((5 - T + 9 * C + 4 * C ** 2) * A ** 4) / 24)) +
    falseNorthing;
  console.log(`Kertau Coordinates:  ${kertau.easting}E  ${kertau.northing}N`);
  return `Kertau Coordinates:  ${kertau.easting}E  ${kertau.northing}N `;
};
