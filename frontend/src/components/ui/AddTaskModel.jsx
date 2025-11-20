// import React, { useEffect, useMemo, useState } from "react";

// const defaultForm = {
//   id: null,
//   title: "",
//   description: "",
//   employee_id: "",
//   deadline: "",
//   priority: "Normal"
// };

// export default function AddTaskModal({
//   onClose,
//   onSave,
//   employees = [],
//   initialData = null,
//   saving = false
// }) {
//   const [formData, setFormData] = useState(defaultForm);

//   const isEdit = useMemo(() => Boolean(initialData?.id), [initialData]);

//   useEffect(() => {
//     if (initialData) {
//       setFormData({
//         id: initialData.id ?? null,
//         title: initialData.title ?? "",
//         description: initialData.description ?? "",
//         employee_id:
//           initialData.employee_id !== undefined && initialData.employee_id !== null
//             ? String(initialData.employee_id)
//             : initialData.employeeId !== undefined && initialData.employeeId !== null
//               ? String(initialData.employeeId)
//               : "",
//         deadline: initialData.deadline ?? "",
//         priority: initialData.priority ?? "Normal"
//       });
//     } else {
//       setFormData(defaultForm);
//     }
//   }, [initialData]);

//   const handleChange = (e) => {
//     const { name, value } = e.target;
//     setFormData(prev => ({ ...prev, [name]: value }));
//   };

//   const handleSubmit = (e) => {
//     e.preventDefault();
//     if (formData.title && formData.employee_id && formData.deadline) {
//       onSave(formData);
//     }
//   };

//   // Close modal when clicking outside
//   const handleBackdropClick = (e) => {
//     if (e.target === e.currentTarget) {
//       onClose();
//     }
//   };

//   return (
//     <div 
//       className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn"
//       onClick={handleBackdropClick}
//     >
//       <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-8 relative animate-slideUp">
//         {/* Close button */}
//         <button
//           onClick={onClose}
//           className="absolute top-6 right-6 text-gray-400 hover:text-gray-600 transition-colors hover:rotate-90 transform duration-200"
//         >
//           <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
//           </svg>
//         </button>

//         {/* Header */}
//         <div className="mb-8">
//           <div className="w-14 h-14 bg-gradient-to-br from-red-500 to-red-600 rounded-2xl flex items-center justify-center mb-4 shadow-lg">
//             <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
//             </svg>
//           </div>
//           <h2 className="text-3xl font-bold text-gray-900">
//             {isEdit ? "Edit Assignment" : "Add Assignment"}
//           </h2>
//           <p className="text-gray-600 mt-2">
//             {isEdit
//               ? "Update the details for this work assignment"
//               : "Create a new work assignment for your team"}
//           </p>
//         </div>

//         {/* Form */}
//         <form onSubmit={handleSubmit} className="space-y-5">
//           {/* Task Title */}
//           <div>
//             <label className="block text-sm font-semibold text-gray-700 mb-2">
//               Task Title <span className="text-red-500">*</span>
//             </label>
//             <input
//               type="text"
//               name="title"
//               value={formData.title}
//               onChange={handleChange}
//               placeholder="Enter task title"
//               className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl  outline-none transition-all placeholder:text-gray-400"
//               required
//             />
//           </div>

//           {/* Employee */}
//           <div>
//             <label className="block text-sm font-semibold text-gray-700 mb-2">
//               Assign to <span className="text-red-500">*</span>
//             </label>
//             <div className="relative">
//               <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
//                 <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
//                 </svg>
//               </div>
//               <select
//                 name="employee_id"
//                 value={formData.employee_id}
//                 onChange={handleChange}
//                 className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl outline-none transition-all placeholder:text-gray-400 bg-white appearance-none cursor-pointer"
//                 required
//               >
//                 <option value="" disabled>
//                   Select employee
//                 </option>
//                 {employees.map((employee) => (
//                   <option key={employee.id} value={employee.id}>
//                     {employee.name}
//                   </option>
//                 ))}
//               </select>
//             </div>
//           </div>

//           {/* Description */}
//           <div>
//             <label className="block text-sm font-semibold text-gray-700 mb-2">
//               Description
//             </label>
//             <textarea
//               name="description"
//               value={formData.description}
//               onChange={handleChange}
//               placeholder="Add task details"
//               className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl outline-none transition-all placeholder:text-gray-400 min-h-[100px]"
//             />
//           </div>

//           {/* Deadline and Priority Grid */}
//           <div className="grid grid-cols-2 gap-4">
//             {/* Deadline */}
//             <div>
//               <label className="block text-sm font-semibold text-gray-700 mb-2">
//                 Deadline <span className="text-red-500">*</span>
//               </label>
//               <input
//                 type="date"
//                 name="deadline"
//                 value={formData.deadline}
//                 onChange={handleChange}
//                 className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl  outline-none transition-all"
//                 required
//               />
//             </div>

//             {/* Priority */}
//             <div>
//               <label className="block text-sm font-semibold text-gray-700 mb-2">
//                 Priority
//               </label>
//               <select
//                 name="priority"
//                 value={formData.priority}
//                 onChange={handleChange}
//                 className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl  outline-none transition-all bg-white appearance-none cursor-pointer"
//                 style={{
//                   backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='m6 8 4 4 4-4'/%3e%3c/svg%3e")`,
//                   backgroundPosition: 'right 0.5rem center',
//                   backgroundRepeat: 'no-repeat',
//                   backgroundSize: '1.5em 1.5em'
//                 }}
//               >
//                 <option value="Low">Low</option>
//                 <option value="Normal">Normal</option>
//                 <option value="High">High</option>
//               </select>
//             </div>
//           </div>

//           {/* Buttons */}
//           <div className="flex gap-3 pt-6">
//             <button
//               type="button"
//               onClick={onClose}
//               className="flex-1 px-6 py-3 border-2 border-gray-200 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-all hover:border-gray-300"
//             >
//               Cancel
//             </button>
//             <button
//               type="submit"
//               disabled={saving}
//               className="flex-1 px-6 py-3 bg-red-500 text-white rounded-xl font-semibold hover:from-red-600 hover:to-blue-700 transition-all shadow-lg hover:shadow-xl transform hover:scale-[1.02] disabled:opacity-70 disabled:cursor-not-allowed"
//             >
//               {saving ? "Saving..." : isEdit ? "Update Assignment" : "Save Assignment"}
//             </button>
//           </div>
//         </form>
//       </div>

//       <style>{`
//         @keyframes fadeIn {
//           from { opacity: 0; }
//           to { opacity: 1; }
//         }
//         @keyframes slideUp {
//           from { 
//             opacity: 0;
//             transform: translateY(20px);
//           }
//           to { 
//             opacity: 1;
//             transform: translateY(0);
//           }
//         }
//         .animate-fadeIn {
//           animation: fadeIn 0.2s ease-out;
//         }
//         .animate-slideUp {
//           animation: slideUp 0.3s ease-out;
//         }
//       `}</style>
//     </div>
//   );
// }
