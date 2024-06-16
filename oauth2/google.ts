export interface Google_Profile_Data {
  id: string;
  name: string;
  given_name: string;
  family_name: string;
  picture: string;
}

// consider to return specific type/interface etc later
export async function fetch_google_profile_data(accessToken: string): Promise<Google_Profile_Data> {
  const url = "https://www.googleapis.com/oauth2/v1/userinfo?alt=json&access_token=" + accessToken;
  const response = await fetch(url, { method: "GET" });
  const data = await response.json();
  console.log("data inside fetch", data);
  return data? data : undefined;
}