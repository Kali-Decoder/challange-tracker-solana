use anchor_lang::prelude::*;


pub const MAX_NAME_LEN: usize = 50;
pub const MAX_DESCRIPTION_LEN: usize = 500;

#[account]
#[derive(InitSpace)]
pub struct Event{
    #[max_len(50)]
    pub name:String,
    #[max_len(500)]
    pub desc:String,
    pub total_tickets : u64,
    pub start_date:i64,
    pub ticket_price:u64,
    pub event_organizer:Pubkey
}

#[account]
#[derive(InitSpace)]
pub struct Ticket {
    pub buyer :Pubkey,
    pub total_buy_tickets:u64,
    pub buying_price:u64,
    pub event:Pubkey
}


