pub mod constants;
pub mod error;
pub mod instructions;
pub mod state;

use anchor_lang::prelude::*;

pub use constants::*;
pub use instructions::*;
pub use state::state::*;

declare_id!("EddGcwmuVADhAG33hhWg3uE8J2MvdrzSxaf7vYiKd2dx");

#[program]
pub mod counter {
    use super::*;

    pub fn initialize_counter(ctx: Context<InitializeCounter>) -> Result<()> {
        _initialize_counter(ctx)
    }
    pub fn increment_counter(ctx: Context<IncrementCounterContext>) -> Result<()> {
        _increment_counter(ctx)
    }

    pub fn reset_counter(ctx: Context<ResetCounterContext>) -> Result<()> {
        _reset_counter(ctx)
    }
}
