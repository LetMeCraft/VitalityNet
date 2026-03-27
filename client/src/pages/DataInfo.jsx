import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import _ from "lodash";
import * as Papa from "papaparse";
import Loader from "../components/Loader";

function DataInfo() {
  const [data, setData] = useState([]);
  const [sortedColumn, setSortedColumn] = useState(null);
  const [sortDirection, setSortDirection] = useState("asc");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch("/diabetes.csv");
        const csvData = await response.text();
        Papa.parse(csvData, {
          header: true,
          dynamicTyping: true,
          complete: (results) => {
            const rows = (results.data || []).filter((row) =>
              Object.values(row || {}).some((value) => value !== null && value !== ""),
            );
            setData(rows);
          },
        });
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, []);

  const handleSort = (columnName) => {
    if (sortedColumn === columnName) {
      setSortDirection((currentDirection) =>
        currentDirection === "asc" ? "desc" : "asc",
      );
      return;
    }

    setSortedColumn(columnName);
    setSortDirection("asc");
  };

  const sortedData = _.orderBy(data, sortedColumn, sortDirection);

  return (
    <div className="page-shell">
      <div className="page-container space-y-8">
        <motion.section
          initial={{ opacity: 0, y: 36 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="surface-card px-6 py-8 md:px-8 md:py-10"
        >
          <span className="eyebrow">Dataset Overview</span>
          <div className="mt-4 max-w-3xl">
            <h1 className="section-title">Data information</h1>
            <p className="section-copy mt-4">
              Review the diabetes dataset used across the project. You can sort every
              column to inspect the values more comfortably.
            </p>
          </div>
        </motion.section>

        <motion.section
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="table-wrap"
        >
          {data.length > 0 ? (
            <div className="max-h-[70vh] overflow-auto">
              <table className="min-w-full border-collapse text-left">
                <thead className="table-head sticky top-0 z-10">
                  <tr>
                    {Object.keys(data[0]).map((header) => (
                      <th
                        key={header}
                        onClick={() => handleSort(header)}
                        className="cursor-pointer border-b border-[var(--border-soft)] px-4 py-4 text-sm font-semibold"
                      >
                        <div className="flex items-center justify-between gap-3">
                          <span>{header}</span>
                          <span className="text-xs text-slate-500">
                            {sortedColumn === header
                              ? sortDirection === "asc"
                                ? "ASC"
                                : "DESC"
                              : ""}
                          </span>
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {sortedData.map((row, rowIndex) => (
                    <tr
                      key={`${rowIndex}-${row.Age ?? row.Glucose ?? "row"}`}
                      className="border-b border-[var(--border-soft)] last:border-b-0"
                    >
                      {Object.entries(row).map(([key, value]) => (
                        <td key={`${rowIndex}-${key}`} className="px-4 py-3 text-sm text-slate-700">
                          {String(value)}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <Loader />
          )}
        </motion.section>
      </div>
    </div>
  );
}

export default DataInfo;
