"use client";

import { passportInstance } from "@/lib/config";
import { useEffect } from "react";

const CallbackPage = () => {
  useEffect(() => {
    window.addEventListener("load", function () {
      passportInstance.loginCallback();
    });
  }, [passportInstance.loginCallback()]);

  return (
    <div style={{ textAlign: "center" }}>
      Loading... Please close this window if it hangs more than 30 seconds.
    </div>
  );
};

export default CallbackPage;
