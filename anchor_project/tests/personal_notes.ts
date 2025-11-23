import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { PersonalNotes } from "../target/types/personal_notes";
import { assert } from "chai";

describe("personal_notes", () => {
  // Configure the client to use the local cluster.
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  const program = anchor.workspace.personalNotes as Program<PersonalNotes>;

  const noteId = new anchor.BN(1);
  const title = "My First Note";
  const content = "This is the content of my first note.";

  const [notePda] = anchor.web3.PublicKey.findProgramAddressSync(
    [
      Buffer.from("note"),
      provider.wallet.publicKey.toBuffer(),
      noteId.toArrayLike(Buffer, "le", 8),
    ],
    program.programId
  );

  it("Creates a note (Happy Path)", async () => {
    await program.methods
      .createNote(noteId, title, content)
      .accounts({
        note: notePda,
        user: provider.wallet.publicKey,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .rpc();

    const noteAccount = await program.account.note.fetch(notePda);
    assert.equal(noteAccount.title, title);
    assert.equal(noteAccount.content, content);
    assert.equal(noteAccount.id.toString(), noteId.toString());
    assert.equal(
      noteAccount.author.toBase58(),
      provider.wallet.publicKey.toBase58()
    );
  });

  it("Updates a note (Happy Path)", async () => {
    const newTitle = "Updated Title";
    const newContent = "Updated Content";

    await program.methods
      .updateNote(noteId, newTitle, newContent)
      .accounts({
        note: notePda,
        user: provider.wallet.publicKey,
      })
      .rpc();

    const noteAccount = await program.account.note.fetch(notePda);
    assert.equal(noteAccount.title, newTitle);
    assert.equal(noteAccount.content, newContent);
  });

  it("Fails to create a note with too long title (Unhappy Path)", async () => {
    const longTitle = "a".repeat(51);
    const newNoteId = new anchor.BN(2);
    const [newNotePda] = anchor.web3.PublicKey.findProgramAddressSync(
      [
        Buffer.from("note"),
        provider.wallet.publicKey.toBuffer(),
        newNoteId.toArrayLike(Buffer, "le", 8),
      ],
      program.programId
    );

    try {
      await program.methods
        .createNote(newNoteId, longTitle, "content")
        .accounts({
          note: newNotePda,
          user: provider.wallet.publicKey,
          systemProgram: anchor.web3.SystemProgram.programId,
        })
        .rpc();
      assert.fail("Should have failed");
    } catch (e) {
      assert.include(e.message, "TitleTooLong");
    }
  });

  it("Fails to create a note with too long content (Unhappy Path)", async () => {
    const longContent = "a".repeat(201);
    const newNoteId = new anchor.BN(3);
    const [newNotePda] = anchor.web3.PublicKey.findProgramAddressSync(
      [
        Buffer.from("note"),
        provider.wallet.publicKey.toBuffer(),
        newNoteId.toArrayLike(Buffer, "le", 8),
      ],
      program.programId
    );

    try {
      await program.methods
        .createNote(newNoteId, "title", longContent)
        .accounts({
          note: newNotePda,
          user: provider.wallet.publicKey,
          systemProgram: anchor.web3.SystemProgram.programId,
        })
        .rpc();
      assert.fail("Should have failed");
    } catch (e) {
      assert.include(e.message, "ContentTooLong");
    }
  });

  it("Deletes a note (Happy Path)", async () => {
    await program.methods
      .deleteNote(noteId)
      .accounts({
        note: notePda,
        user: provider.wallet.publicKey,
      })
      .rpc();

    try {
      await program.account.note.fetch(notePda);
      assert.fail("Account should be closed");
    } catch (e) {
      assert.include(e.message, "Account does not exist");
    }
  });
});
