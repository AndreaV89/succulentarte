// React
import React from "react";

// MUI
import Box from "@mui/material/Box";
import TableRow from "@mui/material/TableRow";
import TableCell from "@mui/material/TableCell";
import IconButton from "@mui/material/IconButton";
import Collapse from "@mui/material/Collapse";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import Checkbox from "@mui/material/Checkbox";
import Tooltip from "@mui/material/Tooltip";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";

type CategoriaFormData = {
  id?: string;
  nome: string;
  descrizione: string;
  fotoUrl?: string | null;
  fotoThumbnailUrl?: string | null;
  famigliaId?: string;
};

type RowActions = {
  onOpenModal: (type: "famiglia" | "genere", data: CategoriaFormData) => void;
  onAskDelete: (type: "famiglia" | "genere", id: string, name: string) => void;
  onSelectFamiglia: (id: string) => void;
  onSelectGenere: (id: string) => void;
};

type RowProps = {
  famiglia: CategoriaFormData;
  generi: CategoriaFormData[];
  open: boolean;
  setOpen: () => void;
  isFamigliaSelected: boolean;
  selectedGeneri: string[];
  pianteInFamigliaCount: number;
  pianteInGenereCounts: { [key: string]: number };
  actions: RowActions;
};

export const CategoryRow: React.FC<RowProps> = (props) => {
  const {
    famiglia,
    generi,
    open,
    setOpen,
    isFamigliaSelected,
    selectedGeneri,
    pianteInFamigliaCount,
    pianteInGenereCounts,
    actions,
  } = props;

  return (
    <>
      <TableRow sx={{ borderBottom: "1px solid #f5f5f5" }}>
        <TableCell padding="checkbox">
          <Checkbox
            color="primary"
            checked={isFamigliaSelected}
            onChange={() => actions.onSelectFamiglia(famiglia.id!)}
          />
        </TableCell>
        <TableCell sx={{ width: 60 }}>
          {generi.length > 0 && (
            <IconButton aria-label="expand row" onClick={setOpen} sx={{ p: 0 }}>
              {open ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
            </IconButton>
          )}
        </TableCell>
        <TableCell component="th" scope="row" sx={{ width: "20%" }}>
          {famiglia.nome}
        </TableCell>
        <TableCell
          sx={{
            maxWidth: 300,
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          {famiglia.descrizione}
        </TableCell>

        <TableCell align="right">
          <Tooltip title="Modifica famiglia">
            <IconButton
              color="primary"
              size="small"
              onClick={() => actions.onOpenModal("famiglia", famiglia)}
              sx={{ mr: 1 }}
            >
              <EditIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Elimina famiglia">
            <IconButton
              size="small"
              color="error"
              onClick={() => {
                if (famiglia.id) {
                  actions.onAskDelete("famiglia", famiglia.id, famiglia.nome);
                }
              }}
            >
              <DeleteIcon />
            </IconButton>
          </Tooltip>
        </TableCell>
        <TableCell align="center" width={"10%"}>
          {pianteInFamigliaCount}
        </TableCell>
      </TableRow>
      <TableRow>
        <TableCell style={{ padding: 0, borderBottom: "unset" }} colSpan={6}>
          <Collapse in={open} timeout="auto" unmountOnExit>
            <Box sx={{ padding: 0, borderBottom: "unset" }}>
              <Table aria-label="purchases">
                <TableBody>
                  {generi.length > 0 ? (
                    generi.map((genere) => (
                      <TableRow
                        key={genere.id}
                        sx={{ backgroundColor: "#f5f5f5" }}
                      >
                        <TableCell padding="checkbox">
                          <Checkbox
                            color="primary"
                            checked={selectedGeneri.includes(genere.id!)}
                            onChange={() => actions.onSelectGenere(genere.id!)}
                          />
                        </TableCell>
                        <TableCell sx={{ width: "5%" }} />
                        <TableCell
                          component="th"
                          scope="row"
                          sx={{ width: "20%" }}
                        >
                          - {genere.nome}
                        </TableCell>
                        <TableCell
                          sx={{
                            maxWidth: 300,
                            whiteSpace: "nowrap",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                          }}
                        >
                          {genere.descrizione}
                        </TableCell>

                        <TableCell align="right">
                          <Tooltip title="Modifica genere">
                            <IconButton
                              color="primary"
                              size="small"
                              onClick={() =>
                                actions.onOpenModal("genere", genere)
                              }
                              sx={{ mr: 1 }}
                            >
                              <EditIcon />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Elimina genere">
                            <IconButton
                              size="small"
                              color="error"
                              onClick={() =>
                                actions.onAskDelete(
                                  "genere",
                                  genere.id!,
                                  genere.nome
                                )
                              }
                            >
                              <DeleteIcon />
                            </IconButton>
                          </Tooltip>
                        </TableCell>
                        <TableCell align="center" width={"10%"}>
                          {genere.id ? pianteInGenereCounts[genere.id] || 0 : 0}
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={6} align="center">
                        Nessun genere in questa famiglia.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </Box>
          </Collapse>
        </TableCell>
      </TableRow>
    </>
  );
};
