import { PersistentMap, storage, context } from 'near-sdk-as'
import { AccountId, TokenId } from '../../utils'
import { 
  MAX_SUPPLY, 
  TOTAL_SUPPLY,
  ERROR_CALLER_ID_DOES_NOT_MATCH_EXPECTATION,
  ERROR_MAXIMUM_TOKEN_LIMIT_REACHED,
  ERROR_OWNER_ID_DOES_NOT_MATCH_EXPECTATION,
  ERROR_TOKEN_NOT_OWNED_BY_CALLER
} from './models'


@nearBindgen
export class Contract {

  // The strings used to index variables in storage can be any string
  // Let's set them to single characters to save storage space
  private tokenToOwner = new PersistentMap<TokenId, AccountId>('a')

  // Note that with this implementation, an account can only set one escrow at a
  // time. You could make values an array of AccountIds if you need to, but this
  // complicates the code and costs more in storage rent.
  private escrowAccess = new PersistentMap<AccountId, AccountId>('b')


  /******************/
  /* CHANGE METHODS */
  /******************/

  // Grant access to the given `accountId` for all tokens the caller has
  grant_access(escrow_account_id: string): void {
    escrowAccess.set(context.predecessor, escrow_account_id)
  }

  // Revoke access to the given `accountId` for all tokens the caller has
  revoke_access(escrow_account_id: string): void {
    escrowAccess.delete(context.predecessor)
  }


  

  // Transfer the given `token_id` to the given `new_owner_id`. Account `new_owner_id` becomes the new owner.
  // Requirements:
  // * The caller of the function (`predecessor`) should have access to the token.
  transfer_from(owner_id: string, new_owner_id: string, token_id: TokenId): void {
    const prdecessor = context.predecessor

    // fetch token owner and escrow; assert access
    const owner = tokenToOwner.getSome(token_id)
    assert(owner == owner_id, ERROR_OWNER_ID_DOES_NOT_MATCH_EXPECTATION)
    const escrow = escrowAccess.get(owner)
    assert([owner, escrow].includes(predecessor), ERROR_CALLER_ID_DOES_NOT_MATCH_EXPECTATION)

    // assign new owner to token
    tokenToOwner.set(token_id, new_owner_id)
  }


  /****************/
  /* VIEW METHODS */
  /****************/

  // Returns `true` or `false` based on caller of the function (`predecessor`) having access to account_id's tokens
  check_access(account_id: string): boolean {
    const caller = context.predecessor

    // throw error if someone tries to check if they have escrow access to their own account;
    // not part of the spec, but an edge case that deserves thoughtful handling
    assert(caller != account_id, ERROR_CALLER_ID_DOES_NOT_MATCH_EXPECTATION)

    // if we haven't set an escrow yet, then caller does not have access to account_id
    if (!escrowAccess.contains(account_id)) return false

    const escrow = escrowAccess.getSome(account_id)
    return escrow == caller

  }

  // Get an individual owner by given `tokenId`
  get_token_owner(token_id: TokenId): string {
    return tokenToOwner.getSome(token_id)
  }

  /********************/
  /* NON-SPEC METHODS */
  /********************/

  // Note that ANYONE can call this function! You probably would not want to
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


