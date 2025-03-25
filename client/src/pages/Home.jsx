import { useEffect, useState } from "react";
import { useDataContext } from "../context/data_context";
import { useNavigate } from "react-router-dom";
import {
  ContractTable,
  Loading,
  Pagination,
  SearchContracts,
} from "../components/index.js";

const Home = () => {
  const {
    contracts,
    contract,
    fetchContracts,
    loading,
    clearValues,
    role,
    del,
    renewalFile,
    addEmails,
  } = useDataContext();
  const [toggle, setToggle] = useState(false);
  const [page, setPage] = useState(0);
  const [cont, setCont] = useState([]);
  const navigate = useNavigate();
  // const [emails, setEmails] = useState([]);
  useEffect(() => {
    fetchContracts();
    // eslint-disable-next-line
  }, [contract, toggle, del]);

  useEffect(() => {
    if (loading) return;
    setCont(contracts[page]);
    // eslint-disable-next-line
  }, [loading, page]);

  const handleChnage = (index) => {
    setPage(index);
  };

  const handleCreateContract = () => {
    clearValues();
    navigate("/create");
  };

  const add = (first, second, third, fourth, fifth, six, id, contractNo) => {
    const temp = new Set();
    const emails = [];
    if (first && first !== "clientproxymail@gmail.com") temp.add(first);
    if (second && second !== "clientproxymail@gmail.com") temp.add(second);
    if (third && third !== "clientproxymail@gmail.com") temp.add(third);
    if (fourth && fourth !== "clientproxymail@gmail.com") temp.add(fourth);
    if (fifth && fifth !== "clientproxymail@gmail.com") temp.add(fifth);
    if (six && six !== "clientproxymail@gmail.com") temp.add(six);
    [...temp].map((item) => {
      return emails.push({
        email: item,
        line: `https://cqr.sat9.in/feedback/${id}-${item.split("@")[0]}`,
        contract: contractNo,
      });
    });
    addEmails(emails);
  };

  if (loading) {
    return <Loading />;
  }
  return (
    <div className="container">
      <div className="container">
        <div className="row my-3">
          <div className="col-md-6">
            <h2 className="text-center all-contracts">All Contracts</h2>
          </div>
          {(role === "Sales" || role === "Admin") && (
            <>
              <div className="col-md-3 d-flex justify-content-center">
                <button
                  className="btn btn-success btn-lg my-1"
                  onClick={handleCreateContract}
                >
                  Create Contract
                </button>
              </div>
              {renewalFile && (
                <div className="col-md-3 d-flex justify-content-center">
                  <button className="btn btn-primary btn-sm my-1">
                    <a
                      style={{
                        textDecoration: "none",
                        color: "white",
                      }}
                      href={renewalFile}
                    >
                      Renewal Report
                    </a>
                  </button>
                </div>
              )}
            </>
          )}
        </div>
        <SearchContracts toggle={toggle} setToggle={setToggle} />
        {contracts.length === 0 && (
          <h4 className="text-center m-2 text-danger">No Contract Found</h4>
        )}
        <ContractTable cont={cont} add={add} />
        <Pagination
          contracts={contracts}
          handleChange={handleChnage}
          page={page}
        />
      </div>
    </div>
  );
};

export default Home;
