import { useEffect, useRef } from "react";
import { ScrollView, StyleSheet } from "react-native";
import type { ReactNode } from "react";

import { layout } from "@/constants/theme";

const GAP = 8;

export function Rail({
  children,
  activeIndex,
  itemWidth,
}: {
  children: ReactNode;
  activeIndex: number;
  itemWidth: number;
}) {
  const ref = useRef<ScrollView>(null);
  const settled = useRef(false);
  const offset = Math.max(0, activeIndex * (itemWidth + GAP));

  useEffect(() => {
    if (settled.current) ref.current?.scrollTo({ x: offset, animated: true });
  }, [offset]);

  return (
    <ScrollView
      ref={ref}
      horizontal
      showsHorizontalScrollIndicator={false}
      snapToInterval={itemWidth + GAP}
      decelerationRate="fast"
      onContentSizeChange={() => {
        if (settled.current) return;
        settled.current = true;
        ref.current?.scrollTo({ x: offset, animated: false });
      }}
      style={styles.rail}
      contentContainerStyle={styles.content}
    >
      {children}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  rail: {
    marginHorizontal: -layout.gutter,
  },
  content: {
    paddingHorizontal: layout.gutter,
    gap: GAP,
  },
});
