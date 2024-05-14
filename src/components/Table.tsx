import { Table, Thead, Tbody, Tr, Th, Td } from '@chakra-ui/react';

interface CustomTableProps  {
  columns: any[],
  data: any[]
}

const CustomTable = ({ columns, data }: CustomTableProps) => {
  return (
    <Table variant="simple" >
      <Thead bgColor="light_grey" padding="20px">
        <Tr >
          {columns.map((column, index) => (
            <Th  borderBottom="0px solid #fff"   color="cyan" fontSize="16px" textTransform="capitalize" key={index}>{column.label}</Th>
          ))}
        </Tr>
      </Thead>
      <Tbody>
        {data.map((row, rowIndex) => (
          <Tr  key={rowIndex}>
            {columns.map((column, columnIndex) => (
              <Td borderBottom="0.1px solid #fff" color="#fff" key={columnIndex}>{row[column.field]}</Td>
            ))}
          </Tr>
        ))}
      </Tbody>
    </Table>
  );
};

export default CustomTable;
