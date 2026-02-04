import React, { useEffect, useState } from 'react';
import {
  Gamepad2,
  Music,
  BookOpen,
  GraduationCap,
  Camera,
  Palette,
  Code,
  Dumbbell,
  Plane,
  Heart,
  Coffee,
  Car,
  Home,
  Utensils,
  Shirt,
  TreePine,
  Star,
  Users,
  Globe,
  Zap,
  LucideIcon,
  ArrowRight,
  LoaderCircle,
  Brush,
  Guitar,
  Mountain,
  Waves,
  Microscope,
  Coins,
  PenTool,
  Headphones,
  Flower,
  Rocket,
  Brain,
  Compass,
  Trophy,
  Briefcase,
  Sparkles
} from 'lucide-react';
import { useAnimationControls, motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

export interface Interest {
  id: string;
  name: string;
  icon: LucideIcon;
}

export const DUMMY_INTERESTS: Interest[] = [
  { id: '23', name: 'Hiking & Climbing', icon: Mountain },
  { id: '7', name: 'Programming', icon: Code },
  { id: '31', name: 'Psychology & Mind', icon: Brain },
  { id: '12', name: 'Fashion', icon: Shirt },
  { id: '28', name: 'Podcasts & Audio', icon: Headphones },
  { id: '5', name: 'Photography', icon: Camera },
  { id: '17', name: 'Sports', icon: Zap },
  { id: '35', name: 'Magic & Illusion', icon: Sparkles },
  { id: '2', name: 'Music', icon: Music },
  { id: '26', name: 'Finance & Investing', icon: Coins },
  { id: '14', name: 'Movies & TV', icon: Star },
  { id: '9', name: 'Travel', icon: Plane },
  { id: '21', name: 'Painting', icon: Brush },
  { id: '34', name: 'Entrepreneurship', icon: Briefcase },
  { id: '8', name: 'Fitness', icon: Dumbbell },
  { id: '18', name: 'Coffee Culture', icon: Coffee },
  { id: '30', name: 'Space & Astronomy', icon: Rocket },
  { id: '4', name: 'Learning', icon: GraduationCap },
  { id: '11', name: 'Food & Cooking', icon: Utensils },
  { id: '24', name: 'Water Sports', icon: Waves },
  { id: '16', name: 'Technology', icon: Globe },
  { id: '33', name: 'Competitive Gaming', icon: Trophy },
  { id: '1', name: 'Gaming', icon: Gamepad2 },
  { id: '29', name: 'Gardening & Plants', icon: Flower },
  { id: '6', name: 'Art & Design', icon: Palette },
  { id: '19', name: 'Automotive', icon: Car },
  { id: '27', name: 'Writing & Blogging', icon: PenTool },
  { id: '13', name: 'Nature', icon: TreePine },
  { id: '22', name: 'Musical Instruments', icon: Guitar },
  { id: '10', name: 'Health & Wellness', icon: Heart },
  { id: '32', name: 'Adventure & Exploring', icon: Compass },
  { id: '15', name: 'Socializing', icon: Users },
  { id: '25', name: 'Science & Research', icon: Microscope },
  { id: '3', name: 'Reading', icon: BookOpen },
  { id: '20', name: 'Home & Garden', icon: Home }
];

const MarqueeItem = ({
  interest,
  row,
  isSelected = false,
  onSelect,
  onRemove,
  showEmptySlot
}: {
  interest: Interest;
  row: number;
  isSelected?: boolean;
  onSelect?: (interest: Interest) => Promise<void>;
  onRemove?: (interest: Interest) => Promise<void>;
  showEmptySlot?: boolean;
}) => {
  const animate = useAnimationControls();
  const [isAnimating, setIsAnimating] = useState(false);
  const [firstTime, setFirstTime] = useState(true);

  useEffect(() => {
    if (isSelected) return;
    if (firstTime) {
      setFirstTime(false);
      return;
    }
    animate.start({
      y: 0,
      zIndex: 0,
      rotateZ: 0,
      opacity: 1,
      transition: {
        type: 'spring',
        stiffness: 100,
        damping: 20
      }
    });
  }, [isSelected]);

  const handleClick = async () => {
    if (onSelect) {
      setIsAnimating(true);
      try {
        await Promise.all([
          animate.start({
            y: 32 * 7 - row * 32,
            zIndex: 1,
            rotateZ: Math.random() > 0.5 ? 45 : -45,
            opacity: 0,
            transition: {
              type: 'spring',
              stiffness: 100,
              damping: 20
            }
          }),
          onSelect(interest)
        ]);
      } catch (error) {
        console.error(error);
      }
      setIsAnimating(false);
    } else if (onRemove) {
      try {
        // reverse the animation
        await onRemove(interest);
      } catch (error) {
        console.error(error);
      }
    }
  };

  return (
    <motion.div
      layout
      className={cn('rounded-full active:scale-[0.97]', showEmptySlot && 'bg-white/5')}
    >
      <motion.button
        layout
        initial={{
          opacity: 0
        }}
        whileInView={{
          opacity: 1
        }}
        animate={animate}
        onClick={handleClick}
        className={cn(
          'w-fit bg-zinc-900 border border-white/10 hover:border-white/20 flex items-center justify-start gap-2 shrink-0 h-8 px-3 rounded-full select-none cursor-pointer',
          isSelected && 'pointer-events-none',
          isSelected && !isAnimating && '!opacity-0'
        )}
      >
        <interest.icon className="w-4 h-4" />
        <p className="text-sm whitespace-nowrap">{interest.name}</p>
      </motion.button>
    </motion.div>
  );
};

const InterestMarquee = ({
  selectedInterests,
  onSelect,
  interests,
  showEmptySlot
}: {
  selectedInterests: Interest[];
  onSelect: (interest: Interest) => Promise<void>;
  interests: Interest[];
  showEmptySlot?: boolean;
}) => {
  return (
    <div className="relative mt-4">
      <div className="absolute w-full h-full inset-0 z-10 bg-gradient-to-l from-[#111111] pointer-events-none to-20% to-transparent" />
      <div className="absolute w-full h-full inset-0 z-10 bg-gradient-to-t from-[#111111] pointer-events-none to-20% to-transparent" />

      <div className="grid grid-rows-5 gap-2 overflow-x-auto overflow-y-hidden relative pr-20 pb-10">
        {Array.from({ length: 5 }).map((_, index) => {
          return (
            <div key={index} className="w-full flex items-center justify-start gap-2">
              {interests
                .slice(index * (interests.length / 5), (index + 1) * (interests.length / 5))
                .map((interest) => {
                  return (
                    <MarqueeItem
                      key={interest.id}
                      interest={interest}
                      row={index}
                      isSelected={selectedInterests.some((i) => i.id === interest.id)}
                      onSelect={onSelect}
                      showEmptySlot={showEmptySlot}
                    />
                  );
                })}
            </div>
          );
        })}
      </div>
    </div>
  );
};

const SelectedInterests = ({
  selectedInterests,
  onRemove
}: {
  selectedInterests: Interest[];
  onRemove: (interest: Interest) => Promise<void>;
}) => {
  return (
    <div className="flex max-w-[500px] w-full overflow-x-auto items-center justify-start gap-2 h-8">
      {selectedInterests.map((interest) => (
        <MarqueeItem key={interest.id} interest={interest} row={0} onRemove={onRemove} />
      ))}
    </div>
  );
};

const InterestPicker = ({
  interests = DUMMY_INTERESTS, // You can pass your own interests category here
  showEmptySlot = false, // You can choose to show an empty slot for the selected interests
  onSubmit = async (interests: Interest[]) => {
    // You can pass your own onSubmit function here
    console.log('Selected interests:', interests);
    await new Promise((resolve) => setTimeout(resolve, 4000));
  }
}: {
  interests?: Interest[];
  showEmptySlot?: boolean;
  onSubmit?: (interests: Interest[]) => Promise<void> | void;
}) => {
  const [selectedInterests, setSelectedInterests] = useState<Interest[]>([]);
  const [loading, setLoading] = useState(false);

  const handleSelect = async (interest: Interest) => {
    setSelectedInterests((prev) => [interest, ...prev]);
  };

  const handleRemove = async (interest: Interest) => {
    setSelectedInterests((prev) => prev.filter((i) => i.id !== interest.id));
  };

  const handleSubmit = async () => {
    if (onSubmit) {
      setLoading(true);
      await onSubmit(selectedInterests);
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col max-w-[500px] w-full">
      <div className="flex items-end justify-between">
        <div className="flex flex-col">
          <p className="text-base font-medium">Tell us about your interests</p>
          <p className="text-sm font-muted-foreground text-white/70">Select atleast 5 interests</p>
        </div>
        <AnimatePresence mode="popLayout">
          {selectedInterests.length >= 5 ? (
            <motion.button
              initial={{
                x: -10,
                opacity: 0
              }}
              animate={{
                x: 0,
                opacity: 1
              }}
              exit={{
                x: -10,
                opacity: 0
              }}
              key="button"
              type="button"
              className="w-9 h-9 flex items-center justify-center rounded-full bg-blue-500 cursor-pointer"
              onClick={handleSubmit}
              disabled={loading}
            >
              {loading ? (
                <motion.div
                  initial={{
                    opacity: 0
                  }}
                  animate={{
                    opacity: 1
                  }}
                  exit={{
                    opacity: 0
                  }}
                  key="loader"
                >
                  <LoaderCircle className="animate-spin" />{' '}
                </motion.div>
              ) : (
                <motion.div
                  initial={{
                    opacity: 0
                  }}
                  animate={{
                    opacity: 1
                  }}
                  exit={{
                    opacity: 0
                  }}
                  key="arrow"
                >
                  <ArrowRight />
                </motion.div>
              )}
            </motion.button>
          ) : (
            <motion.p
              initial={{
                x: 10,
                opacity: 0
              }}
              animate={{
                x: 0,
                opacity: 1
              }}
              exit={{
                x: 10,
                opacity: 0
              }}
              key="selected-interests-length"
              className="text-sm font-muted-foreground text-white/70"
            >
              {selectedInterests.length}
            </motion.p>
          )}
        </AnimatePresence>
      </div>
      <InterestMarquee
        selectedInterests={selectedInterests}
        onSelect={handleSelect}
        interests={interests}
        showEmptySlot={showEmptySlot}
      />
      <SelectedInterests selectedInterests={selectedInterests} onRemove={handleRemove} />
    </div>
  );
};

export default InterestPicker;
