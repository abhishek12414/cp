import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Text } from 'react-native-paper';

interface SectionHeaderProps {
  title: string;
  actionLabel?: string;
  onPressAction?: () => void;
  containerStyle?: any;
}

export const SectionHeader: React.FC<SectionHeaderProps> = ({
  title,
  actionLabel = 'View All',
  onPressAction,
  containerStyle,
}) => {
  return (
    <View style={[styles.row, containerStyle]}>
      <Text variant="titleMedium" style={styles.title}>{title}</Text>
      {onPressAction && (
        <TouchableOpacity onPress={onPressAction} hitSlop={8}>
          <Text variant="labelSmall" style={styles.action}>{actionLabel}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  row: {
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 28,
    marginBottom: 12,
  },
  title: {
    fontWeight: '700',
    fontSize: 20,
    color: '#1a1a1a',
  },
  action: {
    fontWeight: '600',
    fontSize: 13,
    color: '#007AFF',
  },
});
