'use client';

import React, { useState } from 'react';
import { useSignMessage } from 'wagmi';
import { config } from '@/app/config';
import axios from 'axios';  

type EthereumAddress = `0x${string}`;

interface SignMessageComponentProps {
    currentAddress: EthereumAddress;
}

const SignMessageComponent: React.FC<SignMessageComponentProps> = ({ currentAddress }) => {
    const { signMessage, isLoading, isError, data } = useSignMessage();
    const [signature, setSignature] = useState<string | null>(null);

    const handleSignMessage = async () => {
        try {
            const signedMessage = await signMessage({ message: config.web3AuthenticationMessage });
            setSignature(signedMessage);

            
            const response = await axios.post(config.ZERO_API_URL + '/api/authenticate', {
                address: currentAddress,
                signature: signedMessage
            });

            console.log('Authentication response:', response.data);
        } catch (error) {
            console.error('Error signing message:', error);
        }
    };

    return (
        <div>
            <button onClick={handleSignMessage} disabled={isLoading}>
                {isLoading ? 'Signing...' : 'Sign Message'}
            </button>
            {isError && <p>Error signing message</p>}
            {signature && (
                <div>
                    <p>Signature:</p>
                    <pre>{signature}</pre>
                </div>
            )}
        </div>
    );
};

export default SignMessageComponent;
