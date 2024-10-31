// ProfileEditor.tsx

"use client";

import { useState } from "react";

interface UserProfile {
  prenom: string;
  nom: string;
  telephone: string;
  email: string;
}

interface ProfileEditorProps {
  userProfile: UserProfile | null;
}

export default function ProfileEditor({ userProfile }: ProfileEditorProps) {
  const [prenom, setPrenom] = useState(userProfile?.prenom || "");
  const [nom, setNom] = useState(userProfile?.nom || "");
  const [telephone, setTelephone] = useState(userProfile?.telephone || "");
  const [email, setEmail] = useState(userProfile?.email || "");

  const handleUpdate = async () => {
    const res = await fetch("/api/user/update", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nom, prenom, telephone, email }),
    });
    const data = await res.json();
    alert(data.message);
  };

  const handleDelete = async () => {
    const confirmed = confirm("Êtes-vous sûr de vouloir supprimer votre compte ?");
    if (confirmed) {
      const res = await fetch("/api/user/delete", { method: "DELETE" });
      const data = await res.json();
      alert(data.message);
      if (res.ok) window.location.href = "/sign-in";
    }
  };

  return (
    <div className="p-6 rounded-md w-full max-w-lg">
      <h2 className="text-3xl font-semibold mb-6 text-center text-green">Éditer mon profil</h2>
      <ul className="space-y-4">
        {/* Prénom */}
        <li className="flex items-center bg-lightblue bg-opacity-50 p-4 rounded-md">
          <span className="mr-4 text-xl text-green">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="w-6 h-6 text-green"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M17.982 18.725A7.488 7.488 0 0 0 12 15.75a7.488 7.488 0 0 0-5.982 2.975m11.963 0a9 9 0 1 0-11.963 0m11.963 0A8.966 8.966 0 0 1 12 21a8.966 8.966 0 0 1-5.982-2.275M15 9.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
              />
            </svg>
          </span>
          <input
            type="text"
            value={prenom}
            onChange={(e) => setPrenom(e.target.value)}
            className="bg-transparent border-none outline-none w-full text-green text-lg"
            placeholder="Prénom"
          />
        </li>

        {/* Nom */}
        <li className="flex items-center bg-lightblue bg-opacity-50 p-4 rounded-md">
          <span className="mr-4 text-xl text-green">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="w-6 h-6 text-green"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M17.982 18.725A7.488 7.488 0 0 0 12 15.75a7.488 7.488 0 0 0-5.982 2.975m11.963 0a9 9 0 1 0-11.963 0m11.963 0A8.966 8.966 0 0 1 12 21a8.966 8.966 0 0 1-5.982-2.275M15 9.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
              />
            </svg>
          </span>
          <input
            type="text"
            value={nom}
            onChange={(e) => setNom(e.target.value)}
            className="bg-transparent border-none outline-none w-full text-green text-lg"
            placeholder="Nom"
          />
        </li>

        {/* Email */}
        <li className="flex items-center bg-lightblue bg-opacity-50 p-4 rounded-md">
          <span className="mr-4 text-xl text-green">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="w-6 h-6 text-green"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75"
              />
            </svg>
          </span>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="bg-transparent border-none outline-none w-full text-green text-lg"
            placeholder="Email"
          />
        </li>

        {/* Téléphone */}
        <li className="flex items-center bg-lightblue bg-opacity-50 p-4 rounded-md">
          <span className="mr-4 text-xl text-green">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="w-6 h-6 text-green"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z"
              />
            </svg>
          </span>
          <input
            type="text"
            value={telephone}
            onChange={(e) => setTelephone(e.target.value)}
            className="bg-transparent border-none outline-none w-full text-green text-lg"
            placeholder="Téléphone"
          />
        </li>
      </ul>

      <div className="mt-6 flex gap-2">
        <button onClick={handleDelete} className="w-1/2 py-2 px-3 bg-red text-white rounded-md text-sm font-medium">
          Supprimer
        </button>
        <button onClick={handleUpdate} className="w-1/2 py-2 px-3 bg-green text-white rounded-md text-sm font-medium">
          Enregistrer
        </button>
       
      </div>
    </div>
  );
}
