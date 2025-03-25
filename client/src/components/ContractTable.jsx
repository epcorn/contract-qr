/* eslint-disable react/prop-types */
import moment from "moment";
import { Link } from "react-router-dom";
import { useDataContext } from "../context/data_context";

function ContractTable({ cont, add }) {
  const { role } = useDataContext();
  return (
    <table className="table table-bordered">
      <thead>
        <tr>
          <th>Contract No</th>
          <th className="mobile-table">Created At</th>
          <th className="mobile-table">Ship To Name</th>
          <th className="mobile-table">Start Date</th>
          <th className="mobile-table">End Date</th>
        </tr>
      </thead>

      <tbody>
        {cont &&
          cont.map((contracts) => {
            const {
              contractNo,
              _id,
              startDate,
              endDate,
              shipToAddress,
              type,
              createdAt,
              billToContact1,
              billToContact2,
              billToContact3,
              shipToContact1,
              shipToContact2,
              shipToContact3,
            } = contracts;
            const { name } = shipToAddress;
            return (
              <tr key={_id}>
                <td style={{ width: 150 }}>{`${contractNo} - ${type}`}</td>
                <td className="mobile-table" style={{ width: 110 }}>
                  {moment(createdAt).format("DD/MM/YYYY")}
                </td>
                <td className="mobile-table">{name}</td>
                <td className="mobile-table" style={{ width: 110 }}>
                  {moment(startDate).format("DD/MM/YYYY")}
                </td>
                <td className="mobile-table" style={{ width: 110 }}>
                  {moment(endDate).format("DD/MM/YYYY")}
                </td>
                <td className="text-center" style={{ width: 120 }}>
                  <Link to={`/contract/${_id}`}>
                    <button className="btn btn-info">Details</button>
                  </Link>
                </td>
                {role === "Admin" && (
                  <td className="text-center" style={{ width: 120 }}>
                    <button
                      className="btn btn-primary"
                      onClick={() =>
                        add(
                          billToContact1.email,
                          billToContact2.email,
                          billToContact3.email,
                          shipToContact1.email,
                          shipToContact2.email,
                          shipToContact3.email,
                          _id,
                          contractNo
                        )
                      }
                    >
                      Feedback
                    </button>
                  </td>
                )}
              </tr>
            );
          })}
      </tbody>
    </table>
  );
}

export default ContractTable;
