"use client";

import { useAnchorWallet, useConnection } from "@solana/wallet-adapter-react";
import { Program, AnchorProvider, BN, web3 } from "@coral-xyz/anchor";
import { useEffect, useState, useCallback } from "react";
import dynamic from "next/dynamic";
import idl from "../utils/personal_notes.json";

const WalletMultiButton = dynamic(
  () =>
    import("@solana/wallet-adapter-react-ui").then(
      (mod) => mod.WalletMultiButton
    ),
  { ssr: false }
);

const PROGRAM_ID = new web3.PublicKey(
  "7aX2L2jU7Eau1uf4qqbfdRPx7hdAuD4MNs8cYtEg6BTL"
);

export default function Home() {
  const wallet = useAnchorWallet();
  const { connection } = useConnection();
  const [notes, setNotes] = useState<any[]>([]);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [id, setId] = useState("");

  const getProgram = useCallback(() => {
    if (!wallet) return null;
    const provider = new AnchorProvider(connection, wallet, {});
    return new Program(idl as any, provider);
  }, [connection, wallet]);

  const fetchNotes = useCallback(async () => {
    const program = getProgram();
    if (!program || !wallet) return;

    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const allNotes = await (program.account as any).note.all([
        {
          memcmp: {
            offset: 8, // Discriminator
            bytes: wallet.publicKey.toBase58(),
          },
        },
      ]);
      setNotes(allNotes);
    } catch (error) {
      console.error("Error fetching notes:", error);
    }
  }, [getProgram, wallet]);

  useEffect(() => {
    fetchNotes();
  }, [fetchNotes]);

  const createNote = async () => {
    const program = getProgram();
    if (!program || !wallet) return;

    try {
      const noteId = new BN(id);
      const [notePda] = web3.PublicKey.findProgramAddressSync(
        [
          Buffer.from("note"),
          wallet.publicKey.toBuffer(),
          noteId.toArrayLike(Buffer, "le", 8),
        ],
        PROGRAM_ID
      );

      await program.methods
        .createNote(noteId, title, content)
        .accounts({
          note: notePda,
          user: wallet.publicKey,
          systemProgram: web3.SystemProgram.programId,
        })
        .rpc();

      alert("Note created!");
      fetchNotes();
    } catch (error) {
      console.error("Error creating note:", error);
      alert("Error creating note: " + error);
    }
  };

  const deleteNote = async (noteId: BN) => {
    const program = getProgram();
    if (!program || !wallet) return;

    try {
      const [notePda] = web3.PublicKey.findProgramAddressSync(
        [
          Buffer.from("note"),
          wallet.publicKey.toBuffer(),
          noteId.toArrayLike(Buffer, "le", 8),
        ],
        PROGRAM_ID
      );

      await program.methods
        .deleteNote(noteId)
        .accounts({
          note: notePda,
          user: wallet.publicKey,
        })
        .rpc();

      alert("Note deleted!");
      fetchNotes();
    } catch (error) {
      console.error("Error deleting note:", error);
      alert("Error deleting note: " + error);
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center p-24 bg-gray-900 text-white">
      <div className="z-10 max-w-5xl w-full items-center justify-between font-mono text-sm lg:flex">
        <h1 className="text-4xl font-bold">Personal Notes dApp</h1>
        <WalletMultiButton />
      </div>

      {wallet ? (
        <div className="w-full max-w-md mt-10 space-y-4">
          <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
            <h2 className="text-2xl mb-4">Create Note</h2>
            <input
              type="number"
              placeholder="Note ID"
              className="w-full p-2 mb-2 bg-gray-700 rounded"
              value={id}
              onChange={(e) => setId(e.target.value)}
            />
            <input
              type="text"
              placeholder="Title"
              className="w-full p-2 mb-2 bg-gray-700 rounded"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
            <textarea
              placeholder="Content"
              className="w-full p-2 mb-4 bg-gray-700 rounded"
              value={content}
              onChange={(e) => setContent(e.target.value)}
            />
            <button
              onClick={createNote}
              className="w-full bg-blue-600 hover:bg-blue-700 p-2 rounded font-bold"
            >
              Create Note
            </button>
          </div>

          <div className="space-y-4">
            <h2 className="text-2xl">My Notes</h2>
            {notes.map((note) => (
              <div
                key={note.publicKey.toString()}
                className="bg-gray-800 p-4 rounded-lg border border-gray-700"
              >
                <h3 className="text-xl font-bold">{note.account.title}</h3>
                <p className="text-gray-400 text-sm">
                  ID: {note.account.id.toString()}
                </p>
                <p className="mt-2">{note.account.content}</p>
                <button
                  onClick={() => deleteNote(note.account.id)}
                  className="mt-4 bg-red-600 hover:bg-red-700 px-4 py-1 rounded text-sm"
                >
                  Delete
                </button>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="mt-20 text-xl">
          Please connect your wallet to continue.
        </div>
      )}
    </main>
  );
}
