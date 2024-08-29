import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";

export default function SweetAlert({
  type,
  title,
  icon,
  html,
  text,
  confirmButtonText,
  showCancelButton,
  cancelButtonText,
}) {
  const MySwal = withReactContent(Swal);
  const Toast = MySwal.mixin({
    toast: true,
    position: "top",
    showConfirmButton: false,
    timer: 3000,
    timerProgressBar: true,
    didOpen: (toast) => {
      toast.onmouseenter = Swal.stopTimer;
      toast.onmouseleave = Swal.resumeTimer;
    },
  });

  if (type === "toast") {
    return Toast.fire({
      icon,
      title,
    });
  }
  return MySwal.fire({
    title,
    icon,
    html,
    text,
    confirmButtonText,
    showCancelButton,
    cancelButtonText,
    customClass: {
      confirmButton: "bg-red-500",
      cancelButton: "bg-green-500",
    },
  });
}
