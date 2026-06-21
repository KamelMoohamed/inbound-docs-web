"use client";
import { useState } from "react";
import { MfaEnroll } from "./MfaEnroll";
import { mfaSetupAction, mfaVerifyAction, mfaDisableAction } from "./actions";

export function MfaEnrollWrapper() {
  const [setupData, setSetupData] = useState<{ otpauthUrl: string; secret: string } | null>(null);
  const setup = async () => {
    const data = await mfaSetupAction();
    setSetupData(data);
  };
  return (
    <MfaEnroll
      setup={setup}
      verify={mfaVerifyAction}
      disable={mfaDisableAction}
      enabled={false}
      otpauthUrl={setupData?.otpauthUrl}
      secret={setupData?.secret}
    />
  );
}
