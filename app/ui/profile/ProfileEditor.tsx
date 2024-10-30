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
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <div className="bg-gray-100 p-6 rounded-md">
        <h2 className="text-3xl font-semibold mb-6 text-center">Éditer mon profil</h2>
        <ul className="space-y-4">
          <li className="flex items-center bg-gray-200 p-4 rounded-md">
            <span className="mr-4 text-xl"><i className="fas fa-user"></i></span>
            <input
              type="text"
              value={prenom}
              onChange={(e) => setPrenom(e.target.value)}
              className="bg-transparent border-none outline-none w-full"
            />
          </li>
          <li className="flex items-center bg-gray-200 p-4 rounded-md">
            <span className="mr-4 text-xl"><i className="fas fa-user"></i></span>
            <input
              type="text"
              value={nom}
              onChange={(e) => setNom(e.target.value)}
              className="bg-transparent border-none outline-none w-full"
            />
          </li>
          <li className="flex items-center bg-gray-200 p-4 rounded-md">
            <span className="mr-4 text-xl"><i className="fas fa-envelope"></i></span>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="bg-transparent border-none outline-none w-full"
            />
          </li>
          <li className="flex items-center bg-gray-200 p-4 rounded-md">
            <span className="mr-4 text-xl"><i className="fas fa-phone"></i></span>
            <input
              type="text"
              value={telephone}
              onChange={(e) => setTelephone(e.target.value)}
              className="bg-transparent border-none outline-none w-full"
            />
          </li>
        </ul>
        <div className="mt-6">
          <button onClick={handleUpdate} className="w-full py-2 px-4 bg-green-600 text-white rounded-md">
            Enregistrer
          </button>
          <button onClick={handleDelete} className="w-full py-2 px-4 bg-red-600 text-white rounded-md mt-4">
            Supprimer mon compte
          </button>
        </div>
      </div>
    </div>
  );
}
