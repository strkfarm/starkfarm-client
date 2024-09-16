import React from 'react';
import { useAtomValue, useSetAtom } from 'jotai';
import {
  Avatar,
  AvatarBadge,
  AvatarGroup,
  Box,
  HStack,
  IconButton,
  Tag,
  TagLabel,
  Text,
  Tooltip,
} from '@chakra-ui/react';
import { CheckIcon, CloseIcon } from '@chakra-ui/icons';
import {
  ALL_FILTER,
  filterAtoms,
  filters,
  updateFiltersAtom,
} from '@/store/protocols';
import { getTokenInfoFromName } from '@/utils';
import { Category, PoolType } from '@/store/pools';
import mixpanel from 'mixpanel-browser';

export function ProtocolFilters() {
  const protocolsFilter = useAtomValue(filterAtoms.protocolsAtom);

  function isProtocolSelected(protocolName: string) {
    return (
      protocolsFilter.includes(ALL_FILTER) ||
      protocolsFilter.includes(protocolName)
    );
  }

  function atleastOneProtocolSelected() {
    return protocolsFilter.length > 0;
  }
  const updateFilters = useSetAtom(updateFiltersAtom);

  return (
    <Box width={'100%'}>
      {filters.protocols.map((p) => (
        <Tag
          size="lg"
          borderRadius="full"
          padding={'2px'}
          bg="color1"
          marginRight={'10px'}
          marginBottom={'10px'}
          as="button"
          onClick={() => {
            console.log('clicked', p.name);
            // generated list of protocols selected. All means array of all protocols.
            const selectedProtocols = protocolsFilter.includes(ALL_FILTER)
              ? []
              : protocolsFilter;

            let updatedProtocols = [];
            if (selectedProtocols.includes(p.name)) {
              updatedProtocols = selectedProtocols.filter((x) => x !== p.name);
            } else {
              updatedProtocols = [...selectedProtocols, p.name];
            }
            if (updatedProtocols.length === filters.protocols.length) {
              updatedProtocols = [ALL_FILTER];
            }
            console.log('updateFilters', updatedProtocols);
            mixpanel.track('Protocol Filter', {
              protocol: p.name,
              selected:
                updatedProtocols.includes(p.name) ||
                updatedProtocols.includes(ALL_FILTER),
              updatedProtocols: JSON.stringify(updatedProtocols),
            });
            updateFilters('protocols', updatedProtocols);
          }}
          key={p.name}
          _hover={{
            boxShadow: '0px 0px 5px var(--chakra-colors-color1)',
          }}
        >
          <Tooltip label={p.name}>
            <Avatar
              src={`${p.logo}`}
              border={'1px solid var(--chakra-colors-bg)'}
              size="sm"
              name={p.name}
              filter={
                isProtocolSelected(p.name)
                  ? 'none'
                  : 'grayscale(100%) sepia(20%) hue-rotate(210deg) brightness(1.2) invert(0.2)'
              }
            />
          </Tooltip>
        </Tag>
      ))}

      {/* Clear all or select all button */}
      <Tag
        size="lg"
        borderRadius="full"
        padding={'2px'}
        bg="color1"
        marginRight={'5px'}
        as="button"
        marginTop={'1px'}
      >
        <Tooltip
          label={
            atleastOneProtocolSelected()
              ? 'Clear all DApps'
              : 'Select all DApps'
          }
        >
          <IconButton
            isRound={true}
            size={'sm'}
            variant="solid"
            bg={atleastOneProtocolSelected() ? 'bg' : 'purple'}
            color={atleastOneProtocolSelected() ? 'purple' : 'bg'}
            fontSize="10px"
            aria-label={
              atleastOneProtocolSelected() ? 'Clear all' : 'Select all'
            }
            icon={atleastOneProtocolSelected() ? <CloseIcon /> : <CheckIcon />}
            onClick={() => {
              updateFilters(
                'protocols',
                atleastOneProtocolSelected() ? [] : [ALL_FILTER],
              );
              mixpanel.track('Clear/Select all protocols', {
                atleastOneProtocolSelected: atleastOneProtocolSelected(),
              });
            }}
            _hover={{
              bg: atleastOneProtocolSelected() ? 'bg' : 'purple',
              boxShadow: '0px 0px 5px var(--chakra-colors-color1)',
            }}
          />
        </Tooltip>
      </Tag>
    </Box>
  );
}

export function CategoryFilters() {
  const updateFilters = useSetAtom(updateFiltersAtom);
  const protocolFilters = useAtomValue(filterAtoms.protocolsAtom);
  const categoriesFilter = useAtomValue(filterAtoms.categoriesAtom);
  const riskLevelFilters = useAtomValue(filterAtoms.riskAtom);
  const poolTypeFilters = useAtomValue(filterAtoms.typesAtom);

  function updateCategory(category: Category) {
    const existingCategories = categoriesFilter.includes(ALL_FILTER)
      ? []
      : categoriesFilter;
    let isCategoryAdded = false;
    console.log('filter34', 'categories', existingCategories);
    if (existingCategories.includes(category)) {
      const newFilters = existingCategories.filter(
        (x) => x !== category.valueOf(),
      );
      updateFilters(
        'categories',
        newFilters.length === 0 ? [ALL_FILTER] : newFilters,
      );
    } else {
      updateFilters('categories', [...existingCategories, category.valueOf()]);
      isCategoryAdded = true;
    }
    mixpanel.track('Category Filter', {
      category: category.valueOf(),
      selected: isCategoryAdded,
    });
  }

  function updateRiskLevel(riskLevels: string[], riskLevel = 'low') {
    let existingRiskLevels = riskLevelFilters.includes(ALL_FILTER)
      ? []
      : riskLevelFilters;

    let isSelected = false;
    console.log('filter34', 'riskLevels', existingRiskLevels);
    riskLevels.map((riskLevel) => {
      if (existingRiskLevels.includes(riskLevel)) {
        const newFilters = existingRiskLevels.filter((x) => x !== riskLevel);
        existingRiskLevels =
          newFilters.length === 0 ? [ALL_FILTER] : newFilters;
        updateFilters('risk', existingRiskLevels);
      } else {
        existingRiskLevels = [...existingRiskLevels, riskLevel];
        isSelected = true;
        updateFilters('risk', existingRiskLevels);
      }
    });

    mixpanel.track('Risk Filter', {
      riskLevel,
      selected: isSelected,
    });
  }

  function updatePoolType(types: PoolType[], name: string) {
    let existingPoolTypes = poolTypeFilters.includes(ALL_FILTER)
      ? []
      : poolTypeFilters;
    console.log('filter34', 'poolType', existingPoolTypes);
    let isSelected = false;
    types.map((type) => {
      if (existingPoolTypes.includes(type.valueOf())) {
        const newFilters = existingPoolTypes.filter(
          (x) => x !== type.valueOf(),
        );
        existingPoolTypes = newFilters.length === 0 ? [ALL_FILTER] : newFilters;
        updateFilters('poolTypes', existingPoolTypes);
      } else {
        existingPoolTypes = [...existingPoolTypes, type.valueOf()];
        isSelected = true;
        updateFilters('poolTypes', existingPoolTypes);
      }
    });
    mixpanel.track('Pool Type Filter', {
      poolType: name,
      selected: isSelected,
    });
  }

  function isLowRisk() {
    return riskLevelFilters.includes('1') || riskLevelFilters.includes('2');
  }

  function getTextProps(isActive: boolean) {
    return {
      fontSize: '14px',
      color: isActive ? 'bg' : 'color2Text',
    };
  }

  return (
    <Box width={'100%'}>
      {/* <Text color={'white'}>Protocols: {JSON.stringify(protocolFilters)}</Text>
      <Text color={'white'}>Category: {JSON.stringify(categoriesFilter)}</Text>
      <Text color={'white'}>Risk: {JSON.stringify(riskLevelFilters)}</Text>
      <Text color={'white'}>Types: {JSON.stringify(poolTypeFilters)}</Text> */}

      {/* Stable pools */}
      <Tag
        size="lg"
        borderRadius="full"
        mr={'10px'}
        padding={'6px 10px'}
        as={'button'}
        onClick={() => {
          updateCategory(Category.Stable);
        }}
        bg={
          categoriesFilter.includes(Category.Stable.valueOf())
            ? 'purple'
            : 'color1'
        }
        marginBottom={'10px'}
      >
        <AvatarGroup size={'xs'} spacing={'-15px'} mr={'5px'}>
          <Avatar
            src={getTokenInfoFromName('USDC').logo}
            name="USDC"
            key={'USDC'}
          />
          <Avatar
            src={getTokenInfoFromName('USDT').logo}
            name="USDC"
            key={'USDT'}
          />
        </AvatarGroup>
        <TagLabel
          {...getTextProps(
            categoriesFilter.includes(Category.Stable.valueOf()),
          )}
        >
          {Category.Stable.valueOf()}
        </TagLabel>
      </Tag>

      {/* STRK pools */}
      <Tag
        size="lg"
        borderRadius="full"
        mr={'10px'}
        padding={'6px 10px'}
        as={'button'}
        onClick={() => {
          updateCategory(Category.STRK);
        }}
        bg={
          categoriesFilter.includes(Category.STRK.valueOf())
            ? 'purple'
            : 'color1'
        }
        marginBottom={'10px'}
      >
        <AvatarGroup size={'xs'} spacing={'-15px'} mr={'5px'}>
          <Avatar
            src={getTokenInfoFromName('STRK').logo}
            name="STRK"
            key={'STRK'}
          />
        </AvatarGroup>
        <TagLabel
          {...getTextProps(categoriesFilter.includes(Category.STRK.valueOf()))}
        >
          {Category.STRK.valueOf()}
        </TagLabel>
      </Tag>

      {/* Low risk pools */}
      <Tag
        size="lg"
        borderRadius="full"
        mr={'10px'}
        padding={'6px 10px'}
        as={'button'}
        onClick={() => {
          updateRiskLevel(['1', '2']);
        }}
        bg={isLowRisk() ? 'purple' : 'color1'}
        marginBottom={'10px'}
      >
        <AvatarGroup size={'xs'} spacing={'-15px'} mr={'5px'}>
          {['USDC', 'USDT', 'STRK', 'ETH'].map((token, index) => (
            <Avatar
              src={getTokenInfoFromName(token).logo}
              name={token}
              key={token}
            >
              {index == 0 && <AvatarBadge boxSize="1.25em" bg="green.500" />}
            </Avatar>
          ))}
        </AvatarGroup>
        <TagLabel {...getTextProps(isLowRisk())}>Low risk</TagLabel>
      </Tag>

      {/* DEXes */}
      <Tag
        size="lg"
        borderRadius="full"
        mr={'10px'}
        padding={'8px 10px'}
        as={'button'}
        onClick={() => {
          updatePoolType([PoolType.DEXV2, PoolType.DEXV3], 'DEX');
        }}
        bg={
          poolTypeFilters.includes(PoolType.DEXV2.valueOf()) ||
          poolTypeFilters.includes(PoolType.DEXV3.valueOf())
            ? 'purple'
            : 'color1'
        }
        marginBottom={'10px'}
      >
        <TagLabel
          {...getTextProps(
            poolTypeFilters.includes(PoolType.DEXV2.valueOf()) ||
              poolTypeFilters.includes(PoolType.DEXV3.valueOf()),
          )}
        >
          DEX Pools
        </TagLabel>
      </Tag>

      {/* Lending */}
      <Tag
        size="lg"
        borderRadius="full"
        mr={'10px'}
        padding={'8px 10px'}
        as={'button'}
        onClick={() => {
          updatePoolType([PoolType.Lending], 'Lending');
        }}
        bg={poolTypeFilters.includes(PoolType.Lending) ? 'purple' : 'color1'}
        marginBottom={'10px'}
      >
        <TagLabel {...getTextProps(poolTypeFilters.includes(PoolType.Lending))}>
          Lending Pools
        </TagLabel>
      </Tag>

      {/* Derivatives */}
      <Tag
        size="lg"
        borderRadius="full"
        mr={'10px'}
        padding={'8px 10px'}
        as={'button'}
        onClick={() => {
          updatePoolType([PoolType.Derivatives], 'Derivatives');
        }}
        bg={
          poolTypeFilters.includes(PoolType.Derivatives) ? 'purple' : 'color1'
        }
        marginBottom={'10px'}
      >
        <TagLabel
          {...getTextProps(poolTypeFilters.includes(PoolType.Derivatives))}
        >
          Derivative Pools
        </TagLabel>
      </Tag>

      {/* Reset */}
      <Tag
        size="lg"
        bg="color1"
        borderRadius="full"
        mr={'10px'}
        padding={'8px 10px'}
        as={'button'}
        onClick={() => {
          updateFilters('categories', [ALL_FILTER]);
          updateFilters('risk', [ALL_FILTER]);
          updateFilters('poolTypes', [ALL_FILTER]);
          mixpanel.track('Reset Filters');
        }}
        marginBottom={'10px'}
      >
        <TagLabel {...getTextProps(false)}>
          <HStack>
            <Text>Reset</Text> <CloseIcon fontSize={'10px'} />
          </HStack>
        </TagLabel>
      </Tag>
    </Box>
  );
}
