import React, { useRef, useEffect } from 'react';
import { View, TextInput, Keyboard } from 'react-native';

type CodeInputProps = {
    codeLength: number;
    value: string[];
    onChange: (code: string[]) => void;
    inputClassName?: string;
    containerClassName?: string;
};

export const CodeInput: React.FC<CodeInputProps> = ({
    codeLength,
    value,
    onChange,
    inputClassName = '',
    containerClassName = '',
}) => {
    const inputRefs = Array(codeLength)
        .fill(0)
        .map(() => useRef<TextInput>(null));

    useEffect(() => {
        inputRefs[0]?.current?.focus();
    }, []);

    const handleCodeChange = (text: string, index: number) => {
        const newCode = [...value];
        newCode[index] = text;
        onChange(newCode);

        // Auto-focus suivant
        if (text.length === 1 && index < codeLength - 1) {
            inputRefs[index + 1].current?.focus();
        } else if (text.length === 0 && index > 0) {
            inputRefs[index - 1].current?.focus();
        }

        // Fermer clavier si tout est rempli
        const completed = newCode.every((digit) => digit.length === 1);
        if (completed) {
            Keyboard.dismiss();
        }
    };

    return (
        <View className={`flex-row justify-center items-center ${containerClassName}`}>
            {value.map((digit, index) => (
                <TextInput
                    key={index}
                    ref={inputRefs[index]}
                    className={`w-20 h-20 bg-white rounded-xl mx-1 text-2xl text-center shadow ${inputClassName}`}
                    keyboardType="number-pad"
                    maxLength={1}
                    value={digit}
                    onChangeText={(text) => handleCodeChange(text, index)}
                    selectTextOnFocus={true}
                />
            ))}
        </View>
    );
};

export default CodeInput;
