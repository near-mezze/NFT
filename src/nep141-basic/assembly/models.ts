import { toYocto} from '../../utils'

/**************************/
/* DATA TYPES AND STORAGE */
/**************************/


// Note that MAX_SUPPLY is implemented here as a simple constant
// It is exported only to facilitate unit testing
export const MAX_SUPPLY = u64(10)

// This is a key in storage used to track the current minted supply
export const TOTAL_SUPPLY = 'c'

// NEP-141 Spec: Caller of the method must attach a deposit of 1 yoctoⓃ for security purposes
export const EXPECTED_DEPOSIT = toYocto(1);

/******************/
/* ERROR MESSAGES */
/******************/

// These are exported for convenient unit testing
export const ERROR_NO_ESCROW_REGISTERED = 'Caller has no escrow registered'
export const ERROR_CALLER_ID_DOES_NOT_MATCH_EXPECTATION = 'Caller ID does not match expectation'
export const ERROR_MAXIMUM_TOKEN_LIMIT_REACHED = 'Maximum token limit reached'
export const ERROR_OWNER_ID_DOES_NOT_MATCH_EXPECTATION = 'Owner id does not match real token owner id'
export const ERROR_TOKEN_NOT_OWNED_BY_CALLER = 'Token is not owned by the caller. Please use transfer_from for this scenario'
export const ERROR_INSUFFICIENT_FUNDS = 'Sender does not have sufficient funds for this transaction.'
export const ERROR_DEPOSIT_DOES_NOT_MATCH_EXPECTATION = 'Attached deposit must be EXACTLY 1 yoctoⓃ.'