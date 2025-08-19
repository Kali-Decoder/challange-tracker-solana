use anchor_lang::prelude::*;

#[account]
pub struct Counter {
    pub owner: Pubkey,        // The wallet that owns this counter
    pub count: u64,           // Current counter value
    pub total_increments: u64, // Total number of times incremented (persists through resets)
    pub created_at: i64,      // Unix timestamp when counter was created
}

impl Counter {
    pub const INIT_SPACE: usize = 32 + 8 + 8 + 8; // No discriminator here
}