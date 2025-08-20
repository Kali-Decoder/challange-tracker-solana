# Project Description

**Deployed Frontend URL:** [https://challange-tracker-solana.vercel.app/](https://challange-tracker-solana.vercel.app/)  

**Solana Program ID:**  
- Counter Project: `EddGcwmuVADhAG33hhWg3uE8J2MvdrzSxaf7vYiKd2dx`  
- Challenge Tracker: `ALH6gghhaNkLbYZ9NadrYQUbqB3XSKnKo6ALgZE3htW`  

## Project Overview

### Description
This project includes two dApps in one: a Counter project and a Challenge Tracker.  

- **Counter Project:** Allows users to increment and decrement a counter on-chain.  
- **Challenge Tracker:** Enables users to create challenges, add daily tasks, and track task completion. Both challenges and tasks are stored securely on-chain using PDAs. 

### Key Features
- Feature 1: Counter increment/decrement on-chain.  
- Feature 2: Create and track challenges.  
- Feature 3: Add daily tasks to challenges.  
- Feature 4: Mark tasks as completed and track progress.  
  
### How to Use the dApp
1. **Connect Wallet**  
2. **Counter Project:**  
   - Increment or decrement the counter.  
   - View total increments and current count.  
3. **Challenge Tracker:**  
   - Create a challenge by selecting type and duration.  
   - Add tasks for each day of the challenge.  
   - Complete tasks and monitor progress.  
   - View an overview of challenges and completed tasks.

## Program Architecture
The dApps use Solana programs written in Anchor, with PDAs for deterministic account management.

### PDA Usage
**PDAs Used:**  
- **Counter PDA:** Stores counter details per user.  
- **UserProfile PDA:** Stores user’s challenges.  
- **Challenge PDA:** Stores challenge data using user wallet and challenge ID as seeds.  
- **Task PDA:** Stores task data derived from the parent challenge PDA and task day. 

### Program Instructions
**Counter Program:**  
- **Increment:** Adds 1 to the counter and updates total increments.  
- **Decrement:** Subtracts 1 from the counter.  

**Challenge Tracker Program:**  
- **CreateChallenge:** Initializes a new challenge.  
- **AddTask:** Adds a daily task to a challenge.  
- **UploadPost/CompleteTask:** Marks a task as completed. 

### Account Structure

#### Challenge Tracker Accounts

```rust
use anchor_lang::prelude::*;

#[account]
pub struct UserProfile {
    pub owner: Pubkey,
    pub challenges: Vec<Pubkey>, 
}

#[account]
#[derive(InitSpace)]
pub struct Task {
    pub post_id: u64,
    pub owner: Pubkey,
    #[max_len(200)]
    pub title: String,
    #[max_len(1000)]
    pub discription: String,
    #[max_len(100)]
    pub emoji: String,
    #[max_len(100)]
    pub current_time: String,
    pub challenge: Pubkey,
    pub day: u64,   
}

#[account]
pub struct Challenge {
    pub challenge_id: u64,
    pub owner: Pubkey,
    pub current_day: u32,
    pub total_days: u32,
    pub completed: bool,
    pub challenge_type: ChallengeType,
    pub posts: Vec<Pubkey>,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, PartialEq, Eq, Debug)]
pub enum ChallengeType {
    OneWeek,
    OneMonth,
    TwoMonths,
    SixMonths,
    OneYear,
    SeventyFiveHard,
}
```
## Testing

### Test Coverage
[TODO: Describe your testing approach and what scenarios you covered]

**Happy Path Tests:**
- Test 1: [Description]
- Test 2: [Description]
- ...

**Unhappy Path Tests:**
- Test 1: [Description of error scenario]
- Test 2: [Description of error scenario]
- ...

### Running Tests
```bash
# Commands to run your tests
anchor test
```

### Additional Notes for Evaluators

[TODO: Add any specific notes or context that would help evaluators understand your project better]