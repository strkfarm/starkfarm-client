import React from "react";
import Select, { StylesConfig } from "react-select";
import {
  ALL_FILTER,
  filterAtoms,
  filters,
  updateFiltersAtom,
} from "@/store/pools";
import * as chroma from "chroma.ts";
import { useAtom, useSetAtom } from "jotai";
import {
  Accordion,
  AccordionButton,
  AccordionItem,
  AccordionPanel,
  Box,
  Container,
  Stack,
  Text,
} from "@chakra-ui/react";
import { HamburgerIcon } from "@chakra-ui/icons";

export interface Option {
  readonly value: string;
  readonly label: string;
  readonly color: string;
  readonly isFixed?: boolean;
  readonly isDisabled?: boolean;
}

const colourStyles: StylesConfig<Option, true> = {
  control: (styles) => ({
    ...styles,
    padding: "10px 0",
    backgroundColor: "var(--chakra-colors-bg)",
    borderColor: "var(--chakra-colors-bg)",
  }),
  option: (styles, { data, isDisabled, isFocused, isSelected }) => {
    const color = chroma.color(data.color);
    return {
      ...styles,
      backgroundColor: "var(--chakra-colors-bg)",
      color: isDisabled
        ? "#ccc"
        : isSelected
          ? chroma.contrast(color, "white") > 2
            ? "white"
            : "black"
          : data.color,
      cursor: isDisabled ? "not-allowed" : "default",

      ":active": {
        ...styles[":active"],
        backgroundColor: !isDisabled
          ? isSelected
            ? data.color
            : color.alpha(0.3).css()
          : undefined,
      },
    };
  },
  container: (styles, {}) => {
    return {
      ...styles,
      width: "100%",
    };
  },
  dropdownIndicator: (styles, {}) => {
    return {
      ...styles,
      color: "var(--chakra-colors-color2)",
    };
  },
  clearIndicator: (styles, {}) => {
    return {
      ...styles,
      color: "var(--chakra-colors-color2)",
    };
  },
  indicatorSeparator: (styles, {}) => {
    return {
      ...styles,
      backgroundColor: "var(--chakra-colors-color2)",
    };
  },
  menu: (styles, {}) => {
    return {
      ...styles,
      backgroundColor: "var(--chakra-colors-highlight)",
    };
  },
  multiValue: (styles, { data }) => {
    const color = chroma.color(data.color);
    return {
      ...styles,
      fontWeight: "bold",
      backgroundColor: "none",
      borderColor: color.alpha(0.7).css(),
      borderWidth: "1px",
      borderRadius: "5px",
    };
  },
  multiValueLabel: (styles, { data }) => ({
    ...styles,
    color: data.color,
  }),
  multiValueRemove: (styles, { data }) => ({
    ...styles,
    color: data.color,
    ":hover": {
      backgroundColor: data.color,
      color: "white",
    },
  }),
};

export default function Filters() {
  // const colors: readonly string[] = ['#00B8D9', '#407cd5', '#7967e5', '#FF5630',
  // '#FF8B00','#FFC400', '#36B37E', '#00875A', '#253858', '#666666']

  const colors = ["rgba(86, 118, 254, 1)", "rgb(127 73 229)"];
  const updateFilters = useSetAtom(updateFiltersAtom);

  const protocolOptions: readonly Option[] = filters.protocols.map(
    (p, index) => {
      return { value: p, label: p, color: colors[index % colors.length] };
    },
  );

  const categories: readonly Option[] = filters.categories.map((p, index) => {
    return { value: p, label: p, color: colors[index % colors.length] };
  });

  const poolTypes: readonly Option[] = filters.types.map((p, index) => {
    return { value: p, label: p, color: colors[index % colors.length] };
  });
  return (
    <Accordion allowToggle>
      <AccordionItem borderTop="0px" borderBottom="1px" borderColor={"bg"}>
        <h2>
          <AccordionButton>
            <Box
              as="span"
              flex="1"
              textAlign="right"
              color="color2"
              marginRight="10px"
            >
              Filters
            </Box>
            <HamburgerIcon color="color2" />
          </AccordionButton>
        </h2>
        <AccordionPanel pb={4} bg="highlight" overflow={"visible"}>
          <Text color="light_grey" fontSize={"14px"} width="100%">
            Protocols:
          </Text>
          <Select
            closeMenuOnSelect={false}
            defaultValue={[...protocolOptions]}
            isMulti
            placeholder="Select Protocols"
            options={protocolOptions}
            styles={colourStyles}
            onChange={(x, b) => {
              console.log(x, Array.isArray(x), b);
              if (filters.protocols.length == x.length) {
                updateFilters("protocols", [ALL_FILTER]);
              } else {
                updateFilters(
                  "protocols",
                  x.map((p) => p.value),
                );
              }
            }}
          />

          <Stack marginTop={"5px"} direction={{ base: "column", md: "row" }}>
            <Box width={{ base: "100%", md: "50%" }}>
              <Text color="light_grey" fontSize={"14px"} width="100%">
                Categories:
              </Text>
              <Select
                closeMenuOnSelect={false}
                defaultValue={[...categories]}
                isMulti
                placeholder="Select Categories"
                options={categories}
                styles={colourStyles}
                onChange={(x, b) => {
                  console.log(x, Array.isArray(x), b);
                  updateFilters(
                    "categories",
                    x.map((p) => p.value),
                  );
                }}
              />
            </Box>
            <Box width={{ base: "100%", md: "50%" }}>
              <Text color="light_grey" fontSize={"14px"} width="100%">
                Protocol types:
              </Text>
              <Select
                closeMenuOnSelect={false}
                defaultValue={[...poolTypes]}
                isMulti
                placeholder="Select Pool types"
                options={poolTypes}
                styles={colourStyles}
                onChange={(x, b) => {
                  updateFilters(
                    "poolTypes",
                    x.map((p) => p.value),
                  );
                }}
              />
            </Box>
          </Stack>
        </AccordionPanel>
      </AccordionItem>
    </Accordion>
  );
}
