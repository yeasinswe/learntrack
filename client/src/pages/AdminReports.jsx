import { useEffect, useState } from "react";
import api from "../api/axios";
import Loader from "../components/Loader";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export default function AdminReports() {

    const downloadReport = async (student) => {
  const enrollmentsResponse = await api.get("/admin/enrollments");

  const studentEnrollments = enrollmentsResponse.data.filter(
    (e) => e.userId === student.user_id
  );

  const doc = new jsPDF();

  doc.setFontSize(18);
  doc.text("Student Learning Report", 14, 20);

  doc.setFontSize(12);
  doc.text(`Student Name: ${student.full_name}`, 14, 35);
  doc.text(`Email: ${student.email}`, 14, 43);
  doc.text(`Address: ${student.address}`, 14, 51);

  const tableData = studentEnrollments.map((e) => [
    e.courseTitle,
    `${e.progress}%`,
    e.quizScores.length
  ]);

  autoTable(doc, {
    startY: 65,
    head: [["Course", "Progress", "Quiz Attempts"]],
    body: tableData
  });

  doc.save(`${student.full_name}-report.pdf`);
};

  const [users, setUsers] = useState(null);

  useEffect(() => {
    api.get("/admin/users").then((res) => {
      setUsers(res.data.filter((user) => user.role === "user"));
    });
  }, []);

  if (!users) return <Loader />;

  return (
    <div>
      <h1 className="mb-4">Student Reports</h1>

      <div className="table-responsive">
        <table className="table table-striped bg-white">

          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Action</th>
            </tr>
          </thead>

          <tbody>
            {users.map((user) => (
              <tr key={user.id}>

               <td>{user.full_name}</td>

                <td>{user.email}</td>

                <td>
                 <button
                     className="btn btn-primary btn-sm"
                  onClick={() => downloadReport(user)}>
                                          Download PDF
                                </button>
                  
                </td>

              </tr>
            ))}
          </tbody>

        </table>
      </div>
    </div>
  );
}