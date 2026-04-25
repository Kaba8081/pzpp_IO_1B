import React from "react";
import { WorldChannelModal, type WorldChannelModalProps } from "./WorldChannelModal";

export type WorldModalProps = WorldChannelModalProps;

export const WorldModal: React.FC<WorldModalProps> = (props) => <WorldChannelModal {...props} />;
