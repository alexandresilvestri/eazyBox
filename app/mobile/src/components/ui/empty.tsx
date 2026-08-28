import { Text } from "react-native";

import { Card } from "@/components/ui/card";
import { text } from "@/constants/theme";

export function EmptyCard({
  title,
  detail,
}: {
  title: string;
  detail: string;
}) {
  return (
    <Card gap={6}>
      <Text style={text.title}>{title}</Text>
      <Text style={text.meta}>{detail}</Text>
    </Card>
  );
}
