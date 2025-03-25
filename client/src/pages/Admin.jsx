import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Alert, InputRow, Loading, Modal } from "../components";
import { useDataContext } from "../context/data_context";

const Admin = () => {
  const {
    fetchAllUsers,
    users,
    removeUser,
    displayAlert,
    showAlert,
    del,
    loading,
    addComment,
    addComments,
    addSale,
    addSales,
    addBusines,
    addBusiness,
    addCode,
    addContractCode,
    serviceChemicals,
    addServiceChemicals,
    searchSD,
    searchED,
    allJobData,
    modal,
    branchReport,
    adminList,
    allValues,
    toggleCode,
  } = useDataContext();
  const [activeSection, setActiveSection] = useState("");
  const [branch, setBranch] = useState("MUM - 1");
  const representativeList = [];
  const contractCodesList = [];

  if (adminList) {
    adminList?.map(
      (item) => (
        item.sales !== undefined && representativeList.push(item.sales),
        item.contractCode !== undefined &&
          contractCodesList.push({
            name: item.contractCode.name,
            active: item.contractCode.active,
            _id: item._id,
          })
      )
    );
  }
  const { label, value, chemical } = serviceChemicals;
  useEffect(() => {
    fetchAllUsers();
    // eslint-disable-next-line
  }, [del]);

  useEffect(() => {
    allValues();
  }, []);

  const handleSectionChange = (section) => {
    setActiveSection(section);
  };

  const deleteUser = (id) => {
    removeUser(id);
    displayAlert();
  };

  const generateFile = (e) => {
    e.preventDefault();
    allJobData();
  };

  const branchFile = (e) => {
    e.preventDefault();
    const data = { branch, searchSD, searchED };
    branchReport(data);
  };

  const saveValues = () => {
    switch (activeSection) {
      case "sales":
        addSales();
        break;
      case "business":
        addBusiness();
        break;
      case "comment":
        addComments();
        break;
      case "code":
        addContractCode();
        break;
      case "service":
        addServiceChemicals();
        break;
      default:
        console.warn("No valid section selected.");
    }
    displayAlert();
  };

  if (loading) {
    return <Loading />;
  }
  return (
    <div className="container">
      {showAlert && <Alert />}
      {modal && <Modal />}
      <button
        onClick={() => handleSectionChange("user")}
        className="btn my-3 me-3 btn-info btn-lg"
      >
        Show User
      </button>
      <button
        onClick={() => handleSectionChange("sales")}
        className="btn m-3 btn-info btn-lg"
      >
        Add Sales
      </button>
      <button
        onClick={() => handleSectionChange("business")}
        className="btn m-3 btn-info btn-lg"
      >
        Add Business
      </button>
      <button
        onClick={() => handleSectionChange("service")}
        className="btn m-3 btn-info btn-lg"
      >
        Add Service &amp; Chemical
      </button>
      <button
        onClick={() => handleSectionChange("comment")}
        className="btn m-3 btn-info btn-lg"
      >
        Add Service Comment
      </button>
      <button
        onClick={() => handleSectionChange("jobFile")}
        className="btn my-3 me-3 btn-info btn-lg"
      >
        All Job Report
      </button>
      <button
        onClick={() => handleSectionChange("branch")}
        className="btn my-3 me-3 btn-info btn-lg"
      >
        Branch Report
      </button>
      <button
        onClick={() => handleSectionChange("code")}
        className="btn my-3 me-3 btn-info btn-lg"
      >
        Add Source Code
      </button>
      {activeSection === "user" && (
        <table className="table">
          <thead>
            <tr>
              <th scope="col">Name</th>
              <th scope="col">Role</th>
              <th scope="col">Delete</th>
            </tr>
          </thead>
          <tbody>
            {users &&
              users.map((user) => (
                <tr key={user._id}>
                  <td>{user.name}</td>
                  <td>{user.role}</td>
                  {user.role === "Admin" ? (
                    <td>
                      <Link to="/register">
                        <button className="btn btn-success">Add User</button>
                      </Link>
                    </td>
                  ) : (
                    <td>
                      <button
                        onClick={() => deleteUser(user._id)}
                        className="btn btn-danger"
                      >
                        Remove User
                      </button>
                    </td>
                  )}
                </tr>
              ))}
          </tbody>
        </table>
      )}
      <div className="row">
        {activeSection === "comment" && (
          <div className="col-md-5">
            <InputRow label="Comment" name="addComment" value={addComment} />
          </div>
        )}
        {activeSection === "sales" && (
          <div className="col-md-5">
            <InputRow label="Sales Person" name="addSale" value={addSale} />
          </div>
        )}
        {activeSection === "business" && (
          <div className="col-md-5">
            <InputRow label="Business" name="addBusines" value={addBusines} />
          </div>
        )}
        {activeSection === "code" && (
          <div className="col-md-5">
            <div className="">
              <div className="">
                <InputRow
                  label="Contract Code"
                  name="addCode"
                  value={addCode.name}
                />

                <div className="mt-3">
                  <h6 className="text-secondary">Existing Codes</h6>
                  <ul className="list-group">
                    {contractCodesList.map((item) => (
                      <li
                        key={item._id}
                        className="list-group-item d-flex justify-content-between align-items-center"
                      >
                        <span>{item.name}</span>
                        <span
                          className={`badge cursor-pointer ${
                            item.active ? "bg-success" : "bg-danger"
                          }`}
                          onClick={() => toggleCode(item._id)}
                          style={{ cursor: "pointer" }}
                        >
                          {item.active ? "Active" : "Inactive"}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeSection === "service" && (
          <>
            <div className="col-md-4">
              <InputRow
                label="Service Name:"
                id="serviceChemicals"
                type="text"
                name="label"
                value={label}
              />
            </div>
            <div className="col-md-3">
              <InputRow
                label="Value:"
                id="serviceChemicals"
                type="text"
                name="value"
                value={value}
              />
            </div>
            <div className="col-md-4">
              <InputRow
                label="Chemicals:"
                id="serviceChemicals"
                type="text"
                name="chemical"
                value={chemical}
              />
            </div>
          </>
        )}
        {["comment", "sales", "business", "code", "service"].includes(
          activeSection
        ) && (
          <div className="col-md-1">
            <button onClick={saveValues} className="btn mt-1 btn-info ">
              Save
            </button>
          </div>
        )}
      </div>
      {activeSection === "jobFile" && (
        <form className="row" onSubmit={generateFile}>
          <div className="col-md-4">
            <InputRow
              label="From :"
              type="date"
              name="searchSD"
              value={searchSD}
              width={200}
            />
          </div>
          <div className="col-md-4">
            <InputRow
              label="To :"
              type="date"
              name="searchED"
              value={searchED}
              width={200}
            />
          </div>
          <div className="col-md-2">
            <button className="btn btn-primary">Generate File</button>
          </div>
        </form>
      )}
      {activeSection === "branch" && (
        <form className="row" onSubmit={branchFile}>
          <div className="col-md-3 d-flex">
            <label htmlFor="" className="p-2">
              <h4>Branch</h4>
            </label>
            <select
              className="form-select"
              style={{ height: 37, marginTop: 6 }}
              aria-label="Default select example"
              name="type"
              value={branch}
              onChange={(e) => setBranch(e.target.value)}
            >
              {["MUM - 1", "PUN - 1", "BLR - 1"].map((data) => {
                return (
                  <option value={data} key={data}>
                    {data}
                  </option>
                );
              })}
            </select>
          </div>
          <div className="col-md-4">
            <InputRow
              label="From :"
              type="date"
              name="searchSD"
              value={searchSD}
              width={200}
              required={false}
            />
          </div>
          <div className="col-md-3">
            <InputRow
              label="To :"
              type="date"
              name="searchED"
              value={searchED}
              width={200}
              required={false}
            />
          </div>
          <div className="col-md-2">
            <button className="btn btn-primary">Generate File</button>
          </div>
        </form>
      )}
    </div>
  );
};
export default Admin;
