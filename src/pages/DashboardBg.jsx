import { DotLottieReact } from "@lottiefiles/dotlottie-react";
import "../styles/dashboard-bg.css";

const DEFAULT_BG_SRC =
  "https://lottie.host/f1db08fe-8957-4d38-ab87-9f52016e036c/7Kedzn3dAH.lottie";

const DashboardBg = ({ src }) => {
  return (
    <div className="dashboard-bg" aria-hidden="true">
      <DotLottieReact
        src={src || DEFAULT_BG_SRC}
        loop
        autoplay
        style={{ width: "100%", height: "100%" }}
      />
    </div>
  );
};

export default DashboardBg;

