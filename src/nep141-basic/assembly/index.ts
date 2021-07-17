import { PersistentMap, storage, context } from 'near-sdk-as'
import { AccountId, TokenId } from '../../utils'
import { 
  MAX_SUPPLY, 
  ONE_NEAR,
  EXPECTED_DEPOSIT,
  TOTAL_SUPPLY,
  ERROR_CALLER_ID_DOES_NOT_MATCH_EXPECTATION,
  ERROR_MAXIMUM_TOKEN_LIMIT_REACHED,
  ERROR_OWNER_ID_DOES_NOT_MATCH_EXPECTATION,
  ERROR_TOKEN_NOT_OWNED_BY_CALLER,
  ERROR_INSUFFICIENT_FUNDS,
  ERROR_DEPOSIT_DOES_NOT_MATCH_EXPECTATION,
} from './models'


@nearBindgen
export class Contract {

  // simple map of accountIds to their balances. This is where all the magic happens ;)
  private balances = new PersistentMap<TokenId, AccountId>('b')


  /************************************/
  // NEP-141 SPEC methods
  /************************************/

  // https://nomicon.io/Standards/FungibleToken/Core.html

  /*************************************************/
  /* NEP-141 SPEC CHANGE METHODS on fungible token */
  /*************************************************/

  // Simple transfer to a receiver.
  //
  // Requirements:
  // * Caller of the method must attach a deposit of 1 yoctoⓃ for security purposes
  // * Caller must have greater than or equal to the `amount` being requested
  //
  // Arguments:
  // * `receiver_id`: the valid NEAR account receiving the fungible tokens.
  // * `amount`: the number of tokens to transfer, wrapped in quotes and treated
  //   like a string, although the number will be stored as an unsigned integer
  //   with 128 bits.
  // * `memo` (optional): for use cases that may benefit from indexing or
  //    providing information for a transfer.
  ft_transfer(
    receiver_id: string,
    amount: string,
    memo: string | null
  ): void { 

    assert(context.attachedDeposit() === EXPECETED_DEPOSIT, ERROR_DEPOSIT_DOES_NOT_MATCH_EXPECTATION)

    const senderBalance = this.balances.get(Context.sender, u128.Zero);
    assert(senderBalance > amount, ERROR_INSUFFICIENT_FUNDS);
    
    const receiverBalance = this.balances.get(receiver_id, u128.Zero);

    this.balances.set(Context.sender, senderBalance - amount);
    this.balances.set(receiver_id, receiverBalance + amount);
  }

  // Transfer tokens and call a method on a receiver contract. A successful
  // workflow will end in a success execution outcome to the callback on the same
  // contract at the method `ft_resolve_transfer`.
  //
  // You can think of this as being similar to attaching native NEAR tokens to a
  // function call. It allows you to attach any Fungible Token in a call to a
  // receiver contract.
  //
  // Requirements:
  // * Caller of the method must attach a deposit of 1 yoctoⓃ for security
  //   purposes
  // * Caller must have greater than or equal to the `amount` being requested
  // * The receiving contract must implement `ft_on_transfer` according to the
  //   standard. If it does not, FT contract's `ft_resolve_transfer` MUST deal
  //   with the resulting failed cross-contract call and roll back the transfer.
  // * Contract MUST implement the behavior described in `ft_resolve_transfer`
  //
  // Arguments:
  // * `receiver_id`: the valid NEAR account receiving the fungible tokens.
  // * `amount`: the number of tokens to transfer, wrapped in quotes and treated
  //   like a string, although the number will be stored as an unsigned integer
  //   with 128 bits.
  // * `memo` (optional): for use cases that may benefit from indexing or
  //    providing information for a transfer.
  // * `msg`: specifies information needed by the receiving contract in
  //    order to properly handle the transfer. Can indicate both a function to
  //    call and the parameters to pass to that function.
  ft_transfer_call(
    receiver_id: string,
    amount: string,
    memo: string | null,
    msg: string
  ): Promise { 

    assert(context.attachedDeposit() === EXPECETED_DEPOSIT, ERROR_DEPOSIT_DOES_NOT_MATCH_EXPECTATION)

    const senderBalance = this.balances.get(Context.sender, u128.Zero);
    assert(senderBalance > amount, ERROR_INSUFFICIENT_FUNDS);
    
    const receiverBalance = this.balances.get(receiver_id, u128.Zero);

    this.balances.set(Context.sender, senderBalance - amount);
    this.balances.set(receiver_id, receiverBalance + amount);
    
    

  }

  /*********************************************/
  /* SPEC CHANGE METHODS on receiving contract */
  /*********************************************/

  // This function is implemented on the receiving contract.
  // As mentioned, the `msg` argument contains information necessary for the receiving contract to know how to process the request. This may include method names and/or arguments. 
  // Returns a value, or a promise which resolves with a value. The value is the
  // number of unused tokens in string form. For instance, if `amount` is 10 but only 9 are
  // needed, it will return "1".
  ft_on_transfer(
    sender_id: string,
    amount: string,
    msg: string
  ): string {


  }

  /*********************/
  /* SPEC VIEW METHODS */
  /*********************/

  // Returns the total supply of fungible tokens as a string representing the value as an unsigned 128-bit integer.
  ft_total_supply(): string {
    return MAX_SUPPLY
  }

  // Returns the balance of an account in string form representing a value as an unsigned 128-bit integer. If the account doesn't exist must returns `"0"`.
  ft_balance_of(
    account_id: string
  ): string {
    return balances.get(account_id)
  }


  // Finalize an `ft_transfer_call` chain of cross-contract calls.
  //
  // The `ft_transfer_call` process:
  //
  // 1. Sender calls `ft_transfer_call` on FT contract
  // 2. FT contract transfers `amount` tokens from sender to receiver
  // 3. FT contract calls `ft_on_transfer` on receiver contract
  // 4+. [receiver contract may make other cross-contract calls]
  // N. FT contract resolves promise chain with `ft_resolve_transfer`, and may
  //    refund sender some or all of original `amount`
  //
  // Requirements:
  // * Contract MUST forbid calls to this function by any account except self
  // * If promise chain failed, contract MUST revert token transfer
  // * If promise chain resolves with a non-zero amount given as a string,
  //   contract MUST return this amount of tokens to `sender_id`
  //
  // Arguments:
  // * `sender_id`: the sender of `ft_transfer_call`
  // * `receiver_id`: the `receiver_id` argument given to `ft_transfer_call`
  // * `amount`: the `amount` argument given to `ft_transfer_call`
  //
  // Returns a string representing a string version of an unsigned 128-bit
  // integer of how many total tokens were spent by sender_id. Example: if sender
  // calls `ft_transfer_call({ "amount": "100" })`, but `receiver_id` only uses
  // 80, `ft_on_transfer` will resolve with `"20"`, and `ft_resolve_transfer`
  // will return `"80"`.
  ft_resolve_transfer(
    sender_id: string,
    receiver_id: string,
    amount: string
  ): string {
    assert(context.predecessor === sender_id, ERROR_CALLER_ID_DOES_NOT_MATCH_EXPECTATION)
    
  }

  /********************/
  /* NON-SPEC METHODS */
  /********************/


  // NOTE that ANYONE can call this function! You probably would not want to
  // implement a real NFT like this!
  mint_to(owner_id: AccountId): u64 {
    // Fetch the next tokenId, using a simple indexing strategy that matches IDs
    // to current supply, defaulting the first token to ID=1
    //
    // * If your implementation allows deleting tokens, this strategy will not work!
    // * To verify uniqueness, you could make IDs hashes of the data that makes tokens
    //   special; see https://twitter.com/DennisonBertram/status/1264198473936764935

    // TODO: this will be the returned value from Filecoin off-chain storage, and will expire after a certain period of time defaulted to 10 minutes at which time deposits are returned
    const tokenId


    const currentSupply = storage.getPrimitive<u64>(TOTAL_SUPPLY, 1)

    // enforce token limits - not part of the spec but important!
    assert(currentSupply <= MAX_SUPPLY, ERROR_MAXIMUM_TOKEN_LIMIT_REACHED)

    // assign ownership
    tokenToOwner.set(tokenId, owner_id)

    // increment count of minted tokens
    storage.set<u64>(TOTAL_SUPPLY, tokenId + 1)

    // return the tokenId – while typical change methods cannot return data, this
    // is handy for unit tests
    return tokenId
  }


}