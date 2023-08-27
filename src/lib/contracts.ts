import { readContract, writeContract, multicall, watchMulticall } from '@wagmi/core'
import { configureChains, createConfig } from '@wagmi/core'
import { goerli, mainnet } from '@wagmi/core/chains'
 
import { parseAbi } from 'viem'

import { publicProvider } from '@wagmi/core/providers/public'

import { writable } from 'svelte/store';


// renderer: address 0x06a58F43fbb9Cf521c0159EADf6ab07fD8D135B4
// huffplug: address 0xBe0768c32D3AEda087c5064e6f402D91cB9d466A
/// @dev sepolia address of the minter contract
const MINTER_BUTTPLUG = '0xBe0768c32D3AEda087c5064e6f402D91cB9d466A';

const abiPlugger = parseAbi([
  //  ^? const abi: readonly [{ name: "balanceOf"; type: "function"; stateMutability:...
  'function claimed(address user) view returns (bool)',
  'function mint(uint256 nonce) external',
  'function mintWithMerkle(bytes32[] calldata proofs) external',
  'function currentDifficulty() public view returns (uint256)',
  'function salt() public view returns (bytes32)'
])

export async function haveClaimButtplug(user: `0x${string}`) {
    const data = await readContract({
        address: MINTER_BUTTPLUG,
        abi: abiPlugger,
        functionName: 'claimed',
        args: [user],
        blockTag: 'safe',
        chainId: 5 // sepolia
    });

    return data;
}

export async function mintWithMerkle(proofs) {
    const data = await writeContract({
        address: MINTER_BUTTPLUG,
        abi: abiPlugger,
        functionName: 'mintWithMerkle',
        args: [proofs],
        chainId: 5 // sepolia
    });

    return data;
}

export async function mint(nonce) {
    const data = await writeContract({
        address: MINTER_BUTTPLUG,
        abi: abiPlugger,
        functionName: 'mint',
        args: [nonce],
        chainId: 5 // sepolia
    });

    return data;
}

export const difficulty = writable(5n);
export const salt = writable('');

export async function currentDifficultyAndSalt() {
    let config = await getConfigWagmi();
    config = {
        ...config,
        contracts: [
            {
                address: MINTER_BUTTPLUG,
                abi: abiPlugger,
                functionName: 'currentDifficulty',
                chainId: 5 // sepolia
            },
            {
                address: MINTER_BUTTPLUG,
                abi: abiPlugger,
                functionName: 'salt',
                chainId: 5 // sepolia
            },
        ],
    };
   
    const data = await multicall(config);
    const unwatch = watchMulticall(config, (data_) => {
        difficulty.set(data_[0].result);
        salt.set(data_[1].result);
    })
    difficulty.set(data[0].result);
    salt.set(data[1].result);
    return unwatch;
}

let _configWagmi;

export async function getConfigWagmi() {
    if (_configWagmi) {
        return _configWagmi;
    }

    const { chains, publicClient, webSocketPublicClient } = configureChains(
        [goerli],
        [publicProvider()],
    );

    _configWagmi = await createConfig({
        //chains,
        publicClient,
        webSocketPublicClient,
    });

}