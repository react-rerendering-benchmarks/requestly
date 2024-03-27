import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getUserAuthDetails } from "store/selectors";
import { AuthForm } from "./components/Form";
import { OnboardingAuthBanner } from "./components/Banner";
import AUTH from "config/constants/sub/auth";
import MagicLinkModalContent from "components/authentication/AuthForm/MagicAuthLinkModal/MagicLinkModalContent";
import { ONBOARDING_STEPS } from "features/onboarding/types";
import { actions } from "store";
import { BiArrowBack } from "@react-icons/all-files/bi/BiArrowBack";
import { trackAppOnboardingStepCompleted, trackAppOnboardingViewed } from "features/onboarding/analytics";
import { m } from "framer-motion";
import APP_CONSTANTS from "config/constants";
import "./index.scss";

interface Props {
  isOpen: boolean;
  defaultAuthMode: string;
  isOnboarding?: boolean;
  source: string;
  callbacks?: any;
}

export const AuthScreen: React.FC<Props> = ({
  isOpen,
  defaultAuthMode = APP_CONSTANTS.AUTH.ACTION_LABELS.SIGN_UP,
  isOnboarding = false,
  source,
  callbacks = null,
}) => {
  const dispatch = useDispatch();
  const user = useSelector(getUserAuthDetails);
  const [authMode, setAuthMode] = useState(defaultAuthMode);
  const [email, setEmail] = useState("");
  const [isVerifyEmailPopupVisible, setIsVerifyEmailPopupVisible] = useState(false);

  useEffect(() => {
    if (isOpen && isOnboarding) {
      trackAppOnboardingViewed(ONBOARDING_STEPS.AUTH);
    }
  }, [isOpen, isOnboarding]);

  useEffect(() => {
    if (user.loggedIn && isOnboarding) {
      dispatch(actions.updateAppOnboardingStep(ONBOARDING_STEPS.PERSONA));
      trackAppOnboardingStepCompleted(ONBOARDING_STEPS.AUTH);
    }
  }, [user.loggedIn, dispatch, isOnboarding]);

  return (
    <div className="onboarding-auth-screen-wrapper">
      {email && isVerifyEmailPopupVisible ? (
        <div className="verify-email-wrapper">
          <button
            className="auth-screen-back-btn"
            onClick={() => {
              dispatch(actions.updateIsAppOnboardingStepDisabled(false));
              setIsVerifyEmailPopupVisible(false);
            }}
          >
            <BiArrowBack />
            <span>Back</span>
          </button>
          <MagicLinkModalContent email={email} authMode={authMode} eventSource={source} />
        </div>
      ) : (
        <m.div
          transition={{ type: "linear" }}
          layout
          className={`onboarding-auth-screen ${authMode === AUTH.ACTION_LABELS.SIGN_UP ? "w-full" : ""}`}
        >
          <m.div
            transition={{ type: "linear" }}
            layout
            className="onboarding-auth-form-wrapper"
            style={{
              paddingTop:
                authMode === AUTH.ACTION_LABELS.SIGN_UP || authMode === AUTH.ACTION_LABELS.LOG_IN ? "40px" : 0,
            }}
          >
            <AuthForm
              authMode={authMode}
              setAuthMode={setAuthMode}
              email={email}
              setEmail={setEmail}
              isOnboarding={isOnboarding}
              source={source}
              callbacks={callbacks}
              setIsVerifyEmailPopupVisible={setIsVerifyEmailPopupVisible}
            />
          </m.div>
          {authMode === AUTH.ACTION_LABELS.SIGN_UP && (
            <m.div transition={{ type: "linear" }} layout className="onboarding-auth-banner-wrapper">
              <OnboardingAuthBanner />
            </m.div>
          )}
        </m.div>
      )}
    </div>
  );
};
