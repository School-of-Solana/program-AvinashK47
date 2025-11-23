use anchor_lang::prelude::*;

declare_id!("7aX2L2jU7Eau1uf4qqbfdRPx7hdAuD4MNs8cYtEg6BTL");

#[program]
pub mod personal_notes {
    use super::*;

    pub fn create_note(
        ctx: Context<CreateNote>,
        id: u64,
        title: String,
        content: String,
    ) -> Result<()> {
        let note = &mut ctx.accounts.note;
        let clock = Clock::get()?;

        if title.len() > 50 {
            return err!(ErrorCode::TitleTooLong);
        }
        if content.len() > 200 {
            return err!(ErrorCode::ContentTooLong);
        }

        note.author = ctx.accounts.user.key();
        note.id = id;
        note.title = title;
        note.content = content;
        note.created_at = clock.unix_timestamp;
        note.updated_at = clock.unix_timestamp;

        Ok(())
    }

    pub fn update_note(
        ctx: Context<UpdateNote>,
        _id: u64,
        title: String,
        content: String,
    ) -> Result<()> {
        let note = &mut ctx.accounts.note;
        let clock = Clock::get()?;

        if title.len() > 50 {
            return err!(ErrorCode::TitleTooLong);
        }
        if content.len() > 200 {
            return err!(ErrorCode::ContentTooLong);
        }

        note.title = title;
        note.content = content;
        note.updated_at = clock.unix_timestamp;

        Ok(())
    }

    pub fn delete_note(_ctx: Context<DeleteNote>, _id: u64) -> Result<()> {
        Ok(())
    }
}

#[derive(Accounts)]
#[instruction(id: u64)]
pub struct CreateNote<'info> {
    #[account(
        init,
        payer = user,
        space = 8 + 32 + 8 + (4 + 50) + (4 + 200) + 8 + 8,
        seeds = [b"note", user.key().as_ref(), id.to_le_bytes().as_ref()],
        bump
    )]
    pub note: Account<'info, Note>,
    #[account(mut)]
    pub user: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
#[instruction(id: u64)]
pub struct UpdateNote<'info> {
    #[account(
        mut,
        seeds = [b"note", user.key().as_ref(), id.to_le_bytes().as_ref()],
        bump,
    )]
    pub note: Account<'info, Note>,
    pub user: Signer<'info>,
}

#[derive(Accounts)]
#[instruction(id: u64)]
pub struct DeleteNote<'info> {
    #[account(
        mut,
        close = user,
        seeds = [b"note", user.key().as_ref(), id.to_le_bytes().as_ref()],
        bump,
    )]
    pub note: Account<'info, Note>,
    #[account(mut)]
    pub user: Signer<'info>,
}

#[account]
pub struct Note {
    pub author: Pubkey,
    pub id: u64,
    pub title: String,
    pub content: String,
    pub created_at: i64,
    pub updated_at: i64,
}

#[error_code]
pub enum ErrorCode {
    #[msg("The provided title is too long.")]
    TitleTooLong,
    #[msg("The provided content is too long.")]
    ContentTooLong,
}
