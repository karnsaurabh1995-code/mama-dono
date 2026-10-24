'use client';

import React from 'react';
import { db, DEFAULT_BADGE_STYLES } from '@/lib/db';
import { BadgeType, BadgeStyleConfig, Campaign } from '@/lib/types';
import {
  ShieldCheck,
  Flame,
  Award,
  Sparkles,
  CheckCircle2,
  Percent,
  Clock,
  Tag,
} from 'lucide-react';

interface CampaignBadgeProps {
  type: BadgeType;
  text?: string;
  variant?: 'card' | 'detail';
  styleOverride?: Partial<BadgeStyleConfig>;
  className?: string;
}

export function CampaignBadge({
  type,
  text,
  variant = 'detail',
  styleOverride,
  className = '',
}: CampaignBadgeProps) {
  // Retrieve admin-managed styling from database store with safe default fallback
  const baseConfig = (typeof db?.getBadgeStyle === 'function' ? db.getBadgeStyle(type) : null) || DEFAULT_BADGE_STYLES[type] || ({} as BadgeStyleConfig);
  const config = { ...baseConfig, ...(styleOverride || {}) };

  if (!config.isEnabled) {
    return null;
  }

  // Determine sizing based on variant (card = compact for cards/tiles, detail = prominent for hero)
  const isCard = variant === 'card';
  const fontSize = isCard ? config.cardVariant?.fontSize || 10 : config.fontSize || 12;
  const paddingX = isCard ? config.cardVariant?.paddingX || 7 : config.paddingX || 10;
  const paddingY = isCard ? config.cardVariant?.paddingY || 2 : config.paddingY || 4;
  const iconSize = isCard ? config.cardVariant?.iconSize || 12 : config.iconSize || 14;

  const displayText = text || config.defaultText;

  // Render chosen icon
  const renderIcon = () => {
    const iconColor = config.iconColor || config.textColor;
    const iconProps = {
      size: iconSize,
      color: iconColor,
      className: 'shrink-0',
      'aria-hidden': true,
    };

    switch (config.icon) {
      case 'shield':
        return <ShieldCheck {...iconProps} />;
      case 'flame':
        return <Flame {...iconProps} className="shrink-0 fill-current" />;
      case 'award':
        return <Award {...iconProps} />;
      case 'sparkles':
        return <Sparkles {...iconProps} />;
      case 'check':
        return <CheckCircle2 {...iconProps} />;
      case 'percent':
        return (
          <span
            style={{
              fontSize: Math.max(9, iconSize - 2),
              backgroundColor: iconColor,
              color: '#FFFFFF',
              padding: '0 3px',
              borderRadius: '3px',
              fontWeight: 800,
              lineHeight: 1,
            }}
            className="shrink-0 font-mono"
          >
            80G
          </span>
        );
      case 'clock':
        return <Clock {...iconProps} />;
      case 'tag':
        return <Tag {...iconProps} />;
      case 'none':
      default:
        return null;
    }
  };

  const getRadiusClass = () => {
    switch (config.borderRadius) {
      case 'pill':
        return 'rounded-full';
      case 'rounded-lg':
        return 'rounded-xl';
      case 'rounded-md':
        return 'rounded-md';
      case 'square':
        return 'rounded-none';
      default:
        return 'rounded-full';
    }
  };

  const getShadowClass = () => {
    switch (config.shadow) {
      case 'xs':
        return 'shadow-2xs';
      case 'sm':
        return 'shadow-xs';
      case 'md':
        return 'shadow-sm';
      default:
        return '';
    }
  };

  const getFontWeightClass = () => {
    switch (config.fontWeight) {
      case 'black':
        return 'font-black';
      case 'bold':
        return 'font-bold';
      case 'semibold':
        return 'font-semibold';
      case 'medium':
      default:
        return 'font-medium';
    }
  };

  const getLetterSpacingClass = () => {
    switch (config.letterSpacing) {
      case 'widest':
        return 'tracking-widest';
      case 'wider':
        return 'tracking-wider';
      case 'wide':
        return 'tracking-wide';
      case 'normal':
      default:
        return 'tracking-normal';
    }
  };

  return (
    <span
      data-badge-type={type}
      className={`inline-flex items-center gap-1.5 select-none transition-all ${getRadiusClass()} ${getShadowClass()} ${getFontWeightClass()} ${getLetterSpacingClass()} ${className}`}
      style={{
        backgroundColor: config.backgroundColor,
        color: config.textColor,
        borderColor: config.borderColor,
        borderWidth: `${config.borderWidth ?? 1}px`,
        borderStyle: config.borderWidth ? 'solid' : 'none',
        fontSize: `${fontSize}px`,
        paddingLeft: `${paddingX}px`,
        paddingRight: `${paddingX}px`,
        paddingTop: `${paddingY}px`,
        paddingBottom: `${paddingY}px`,
      }}
    >
      {renderIcon()}
      <span className="truncate max-w-[200px]">{displayText}</span>
    </span>
  );
}

/**
 * Renders ONLY the legitimate, factually verified badges for a campaign.
 * Separation of appearance from truth: Never fabricates verified or 80G status!
 */
export function CampaignBadgeGroup({
  campaign,
  variant = 'card',
  className = '',
  includeCategory = true,
  maxBadges,
}: {
  campaign: Campaign;
  variant?: 'card' | 'detail';
  className?: string;
  includeCategory?: boolean;
  maxBadges?: number;
}) {
  const badges: React.ReactNode[] = [];

  // 1. Category Badge
  if (includeCategory && campaign.category) {
    const formattedCategory = campaign.category
      .split('-')
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(' ');
    badges.push(
      <CampaignBadge
        key="cat"
        type="cause_category"
        text={formattedCategory}
        variant={variant}
      />
    );
  }

  // 2. Verified Status (Factual check only)
  if (campaign.verifiedStatus === 'verified') {
    badges.push(
      <CampaignBadge
        key="ver"
        type="verified"
        text={variant === 'detail' ? '100% Medical & NGO Verified' : 'Verified'}
        variant={variant}
      />
    );
  }

  // 3. 80G Tax Exemption (Factual check only)
  if (campaign.has80G) {
    badges.push(
      <CampaignBadge
        key="80g"
        type="tax_80g"
        text={variant === 'detail' ? '50% Tax Exemption (Sec 80G)' : '80G Benefit'}
        variant={variant}
      />
    );
  }

  // 4. Urgent Need (Factual check only)
  if (campaign.urgent) {
    badges.push(
      <CampaignBadge
        key="urg"
        type="urgent"
        text={variant === 'detail' ? 'Urgent Support Needed' : 'Urgent'}
        variant={variant}
      />
    );
  }

  // 5. Fully Funded or Completed Status (Factual check only)
  const netRaised = campaign.netRaisedAmount || Math.round(campaign.raisedAmount * 0.95);
  if (campaign.status === 'completed') {
    badges.push(
      <CampaignBadge
        key="comp"
        type="completed"
        text="Mission Completed"
        variant={variant}
      />
    );
  } else if (netRaised >= campaign.goalAmount) {
    badges.push(
      <CampaignBadge
        key="ff"
        type="fully_funded"
        text="100% Funded"
        variant={variant}
      />
    );
  } else {
    // 6. New Campaign check (within last 14 days)
    const isNew =
      campaign.createdAt &&
      new Date().getTime() - new Date(campaign.createdAt).getTime() < 14 * 24 * 60 * 60 * 1000;
    if (isNew) {
      badges.push(
        <CampaignBadge
          key="new"
          type="new"
          text="New Cause"
          variant={variant}
        />
      );
    }
  }

  const renderedBadges = maxBadges ? badges.slice(0, maxBadges) : badges;

  return (
    <div className={`flex items-center gap-1.5 flex-wrap ${className}`}>
      {renderedBadges}
    </div>
  );
}
