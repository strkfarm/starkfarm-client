import MyNumber from "@/utils/MyNumber";
import { NumberInputField, NumberInput as ChakraNumberInput, NumberInputStepper, NumberIncrementStepper, NumberDecrementStepper, InputGroup, InputLeftAddon } from "@chakra-ui/react";

interface NumberInputProps {
    min: number,
    max: number,
    step: number,
    onChange: (value: string, valueNumber: number) => void,
    value?: string,
    placeholder?: string
}

export function NumberInput(props: NumberInputProps) {
    return <InputGroup>
        <ChakraNumberInput 
            width={'100%'}
            min={props.min}
            max={props.max} 
            step={props.step} 
            color={"white"} bg={'highlight'} borderRadius={'10px'}
            onChange={props.onChange}
            keepWithinRange={false}
            clampValueOnBlur={false}
            value={props.value}
        >
            <NumberInputField border={'0px'} placeholder={props.placeholder || "Amount"}/>
            <NumberInputStepper>
                <NumberIncrementStepper color={'white'} border={'0px'} />
                <NumberDecrementStepper color={'white'} border={'0px'}/>
            </NumberInputStepper>
        </ChakraNumberInput>
    </InputGroup>
}