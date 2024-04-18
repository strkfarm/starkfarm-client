import { WarningTwoIcon } from "@chakra-ui/icons";
import { IconProps, Skeleton, SkeletonProps } from "@chakra-ui/react";
import React from "react";

type LoadingWrapProps = {
    isLoading: boolean,
    isError: boolean,
    skeletonProps: SkeletonProps,
    iconProps?: IconProps
}

export default function LoadingWrap(props: React.PropsWithChildren<LoadingWrapProps>) {
    if (props.isLoading) return <Skeleton {...props.skeletonProps}/>;
    if (props.isError) return <WarningTwoIcon color={'yellow'} {...props.iconProps}/>;

    return <>{props.children}</>;
}