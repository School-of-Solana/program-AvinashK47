# Project Description

**Deployed Frontend URL:** (See Deployment Instructions below)

**Solana Program ID:** 7aX2L2jU7Eau1uf4qqbfdRPx7hdAuD4MNs8cYtEg6BTL

## Project Overview

### Description

This is a decentralized Personal Notes application built on Solana. It allows users to create, update, and delete personal notes that are stored on the blockchain. Each note is uniquely identified by an ID and is owned by the user who created it.

### Key Features

- **Create Note:** Users can create a new note with a unique ID, title, and content.
- **Update Note:** Users can update the title and content of their existing notes.
- **Delete Note:** Users can delete their notes, freeing up the storage space (rent).
- **List Notes:** Users can view all notes they have created.

### How to Use the dApp

1. **Connect Wallet:** Click the "Select Wallet" button to connect your Phantom (or other) wallet.
2. **Create Note:** Enter a Note ID (number), Title, and Content in the form and click "Create Note".
3. **View Notes:** Your created notes will appear in the "My Notes" section.
4. **Delete Note:** Click the "Delete" button on any note to remove it.

## Program Architecture

### PDA Usage

The program uses Program Derived Addresses (PDAs) to deterministically locate note accounts based on the user's public key and a note ID. This avoids the need for a central registry and allows efficient retrieval.

**PDAs Used:**

- **Note Account:** Derived from seeds `[b"note", user_pubkey, note_id]`. This ensures that each note is unique to a user and an ID.

### Program Instructions

**Instructions Implemented:**

- `create_note(id: u64, title: String, content: String)`: Initializes a new note account. Checks for title/content length limits.
- `update_note(id: u64, title: String, content: String)`: Updates the title and content of an existing note. Verifies the signer is the owner.
- `delete_note(id: u64)`: Closes the note account and refunds the rent to the user.

### Account Structure

```rust
#[account]
pub struct Note {
    pub author: Pubkey,    // The owner of the note
    pub id: u64,           // Unique ID for the note
    pub title: String,     // Title of the note (max 50 chars)
    pub content: String,   // Content of the note (max 200 chars)
    pub created_at: i64,   // Timestamp of creation
    pub updated_at: i64,   // Timestamp of last update
}
```

## Testing

### Test Coverage

The project includes comprehensive tests covering both happy and unhappy paths.

**Happy Path Tests:**

- **Creates a note:** Verifies that a note is correctly initialized with the given data.
- **Updates a note:** Verifies that the note data is updated correctly.
- **Deletes a note:** Verifies that the account is closed and data is removed.

**Unhappy Path Tests:**

- **Fails to create a note with too long title:** Ensures the program rejects titles longer than 50 characters.
- **Fails to create a note with too long content:** Ensures the program rejects content longer than 200 characters.

### Running Tests

```bash
cd anchor_project
anchor test
```

### Deployment Instructions

**Frontend:**

1. Navigate to `frontend` directory.
2. Run `npm install`.
3. Run `npm run build`.
4. Deploy to Vercel or Netlify by connecting your GitHub repository.

**Program:**

1. Navigate to `anchor_project`.
2. Run `anchor build`.
3. Run `anchor deploy` (ensure you have SOL on Devnet).
