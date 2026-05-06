import React from "react";
import {
  WorldChannelModal,
  type WorldChannelModalProps,
} from "@/components/modals/WorldChannelModal";

export type WorldModalProps = WorldChannelModalProps;

export const WorldModal: React.FC<WorldModalProps> = (props) => <WorldChannelModal {...props} />;
