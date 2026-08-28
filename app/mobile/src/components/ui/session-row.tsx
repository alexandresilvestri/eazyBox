import { StyleSheet, Text, View } from "react-native";

import { colors, MAX_FONT_SCALE, text } from "@/constants/theme";

export type SessionRowStatus = {
  label: string;
  highlighted?: boolean;
};

export function SessionRow({
  time,
  detail,
  status,
}: {
  time: string;
  detail: string;
  status?: SessionRowStatus;
}) {
  return (
    <View style={styles.row}>
      <Text
        style={styles.time}
        numberOfLines={1}
        maxFontSizeMultiplier={MAX_FONT_SCALE}
      >
        {time}
      </Text>
      <Text style={styles.detail} numberOfLines={1}>
        {detail}
      </Text>
      {status ? (
        <Text
          numberOfLines={1}
          maxFontSizeMultiplier={MAX_FONT_SCALE}
          style={[
            styles.status,
            status.highlighted && styles.statusHighlighted,
          ]}
        >
          {status.label}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: colors.line,
  },
  time: {
    ...text.bodyStrong,
    minWidth: 52,
  },
  detail: {
    ...text.meta,
    flex: 1,
  },
  status: {
    ...text.badge,
    color: colors.ink3,
  },
  statusHighlighted: {
    color: colors.accent,
  },
});
