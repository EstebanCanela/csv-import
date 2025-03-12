"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { ChevronLeft, ChevronRight, MoreVertical } from "lucide-react";
import { getContacts } from "@/shared/api/contacts/contacts.api";
import { ContactResponseDto } from "@/shared/api/contacts/contacts.api.model";

export default function ContactPage() {
  return (
    <Suspense>
      <Contacts />
    </Suspense>
  );
}

function Contacts() {
  const searchParams = useSearchParams();
  const userId = searchParams.get("userId") || "";
  const [contacts, setContacts] = useState<ContactResponseDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cursor, setCursor] = useState<string | null>(null);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [cursorHistory, setCursorHistory] = useState<string[]>([]);

  useEffect(() => {
    const fetchContacts = async () => {
      setIsLoading(true);

      try {
        const response = await getContacts(userId, cursor);

        if (response.status === "IN_PROGRESS" && !response.data.length) {
          setTimeout(() => fetchContacts(), 500);
          return;
        }

        if (response.data.length) {
          setContacts(response.data);
        }
        setNextCursor(response.page.cursor);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "An unknown error occurred"
        );
      } finally {
        setIsLoading(false);
      }
    };

    if (userId) {
      fetchContacts();
    }
  }, [userId, cursor]);

  const handleNextPage = () => {
    if (nextCursor) {
      setCursorHistory((prev) => [...prev, cursor || ""]);
      setCursor(nextCursor);
    }
  };

  const handlePreviousPage = () => {
    if (cursorHistory.length > 0) {
      const previousCursor = cursorHistory[cursorHistory.length - 1];
      setCursor(previousCursor || null);
      setCursorHistory((prev) => prev.slice(0, -1));
    }
  };

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen text-red-500">
        {error}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="max-w-6xl mx-auto p-4">
        <div className="rounded-lg border border-gray-800 overflow-hidden">
          <div className="grid grid-cols-[1fr,auto,auto,auto] gap-4 p-4 bg-[#111] border-b border-gray-800">
            <div className="text-gray-400 font-medium">Email</div>
            <div className="text-gray-400 font-medium">First Name</div>
            <div className="text-gray-400 font-medium">Status</div>
            <div className="text-gray-400 font-medium">Updated</div>
          </div>

          <div className="divide-y divide-gray-800">
            {contacts.map((contact, index) => (
              <div
                key={index}
                className="grid grid-cols-[1fr,auto,auto,auto] gap-4 p-4 items-center hover:bg-gray-900/50 transition-colors"
              >
                <div className="flex items-center gap-4 min-w-0">
                  <div className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center flex-shrink-0">
                    <span className="text-gray-400">
                      {contact.email.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <span className="truncate text-gray-300">
                    {contact.email}
                  </span>
                </div>
                <div className="flex items-center gap-3 min-w-0">
                  <span className="truncate text-gray-300">
                    {contact.first_name}
                  </span>
                </div>
                <div>
                  {contact.status === "error" ? (
                    <span className="px-3 py-1 text-sm bg-green-900/30 text-red-400 rounded-full">
                      ERROR
                    </span>
                  ) : (
                    <span className="px-3 py-1 text-sm bg-green-900/30 text-green-400 rounded-full">
                      SUBSCRIBED
                    </span>
                  )}
                </div>
                <div className="text-gray-400 whitespace-nowrap">
                  {contact.created_at}
                </div>
              </div>
            ))}
          </div>
        </div>

        {contacts.length > 0 && (
          <div className="flex justify-between items-center mt-4 p-4 border-t border-gray-800">
            <button
              onClick={handlePreviousPage}
              disabled={cursorHistory.length === 0}
              className={`flex items-center gap-2 px-4 py-2 rounded-md text-gray-400 ${
                cursorHistory.length === 0
                  ? "opacity-50 cursor-not-allowed"
                  : "hover:bg-gray-800"
              }`}
            >
              <ChevronLeft className="w-5 h-5" />
              Previous
            </button>
            <button
              onClick={handleNextPage}
              disabled={!nextCursor}
              className={`flex items-center gap-2 px-4 py-2 rounded-md text-gray-400 ${
                !nextCursor
                  ? "opacity-50 cursor-not-allowed"
                  : "hover:bg-gray-800"
              }`}
            >
              Next
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        )}

        {contacts.length === 0 && !isLoading && (
          <div className="text-center py-12">
            <p className="text-gray-400">No contacts found</p>
          </div>
        )}

        {contacts.length === 0 && isLoading && (
          <div className="text-center py-12">
            <p className="text-gray-400">Loading...</p>
          </div>
        )}
      </div>
    </div>
  );
}
