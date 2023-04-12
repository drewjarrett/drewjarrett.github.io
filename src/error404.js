import { useRouteError } from "react-router-dom";

function Error404() {
  const error = useRouteError();
  console.error(error);

  return (
    <div className="error">
      <h1>Doh! 404.</h1>
      <p>{error.statusText || error.message}</p>
    </div>
  );
}

export default Error404;
