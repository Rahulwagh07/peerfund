import contractAbi from "@/lib/contract-abi.json"

export const CONTRACT_ADDRESS: `0x${string}` = `0x${process.env.NEXT_PUBLIC_CONTRACT_ADDRESS}`
export const ABI = contractAbi.abi
export const CID_REGEX = /^(Qm[a-zA-Z0-9]{44}|[bafykbzace][A-Za-z0-9]{58})$/;