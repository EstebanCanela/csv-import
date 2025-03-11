import { GetContactsResponseDto } from "./contacts.api.model";

export const getContacts = async (
  userId: string,
  cursor: string | null = null
) => {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/v1/contacts?user_id=${userId}${cursor ? `&cursor=${cursor}` : ""}`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    }
  );

  if (!response.ok) {
    throw new Error("Failed to fetch contacts");
  }

  const data: GetContactsResponseDto = await response.json();

  return data;
};
