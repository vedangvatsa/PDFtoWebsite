import React from 'react';

interface CVUploadIllustrationProps extends React.SVGProps<SVGSVGElement> {
  className?: string;
}

export default function CVUploadIllustration({ className, ...props }: CVUploadIllustrationProps) {
  return (
    <svg
      viewBox="0 0 800 600"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      {...props}
    >
      {/* ── STYLE ── */}
      <style>{`
        .doodle-path {
          stroke: currentColor;
          stroke-width: 3.5;
          stroke-linecap: round;
          stroke-linejoin: round;
        }
        .doodle-fill {
          fill: currentColor;
        }
        .doodle-thin {
          stroke: currentColor;
          stroke-width: 2.2;
          stroke-linecap: round;
          stroke-linejoin: round;
        }
        .doodle-dash {
          stroke: currentColor;
          stroke-width: 2.2;
          stroke-linecap: round;
          stroke-dasharray: 6 8;
        }
      `}</style>

      {/* ── 1. DESK (BASE LINE) ── */}
      <path d="M 40 520 L 760 520" className="doodle-path" />

      {/* ── 2. PLANT & POT (LEFT) ── */}
      {/* Pot */}
      <path d="M 70 480 L 130 480 L 120 520 L 80 520 Z" fill="white" className="doodle-path" />
      {/* Central Leaf */}
      <path d="M 100 480 C 85 430, 100 370, 100 370 C 100 370, 115 430, 100 480 Z" fill="white" className="doodle-path" />
      {/* Left Leaves */}
      <path d="M 100 480 C 70 450, 50 420, 50 420 C 50 420, 80 435, 100 480 Z" fill="white" className="doodle-path" />
      <path d="M 100 480 C 80 465, 65 450, 65 450 C 65 450, 85 455, 100 480 Z" fill="white" className="doodle-path" />
      {/* Right Leaves */}
      <path d="M 100 480 C 130 450, 150 420, 150 420 C 150 420, 120 435, 100 480 Z" fill="white" className="doodle-path" />
      <path d="M 100 480 C 120 465, 135 450, 135 450 C 135 450, 115 455, 100 480 Z" fill="white" className="doodle-path" />

      {/* ── 3. LAPTOP (CENTER-LEFT) ── */}
      {/* Screen Outline */}
      <path d="M 170 380 L 390 388 L 430 520 L 210 510 Z" fill="white" className="doodle-path" />
      {/* Screen Inner Border / Keyboard Area */}
      <path d="M 430 520 L 560 514 L 545 498 L 420 502 Z" fill="white" className="doodle-path" />
      {/* Keypad Track */}
      <path d="M 432 522 L 536 534 L 542 542 L 434 530 Z" fill="#f4f4f5" className="doodle-path" />
      {/* Laptop Apple-style Logo */}
      <circle cx="290" cy="445" r="14" className="doodle-fill" />

      {/* ── 4. PERSON (CENTER-RIGHT) ── */}
      {/* Torso & Shoulder (Back) */}
      <path d="M 570 520 C 560 470, 520 440, 520 440" fill="none" className="doodle-path" />
      {/* Torso & Shoulder (Front/Body) */}
      <path d="M 520 440 C 580 430, 680 405, 715 405 C 725 440, 735 490, 735 520" fill="none" className="doodle-path" />
      
      {/* Neck */}
      <path d="M 580 390 C 585 365, 595 365, 595 365" fill="none" className="doodle-path" />
      <path d="M 622 384 C 625 362, 625 362, 625 362" fill="none" className="doodle-path" />
      {/* Collar Line */}
      <path d="M 582 393 C 595 402, 615 398, 621 386" fill="none" className="doodle-path" />

      {/* Head & Ear */}
      <path d="M 590 365 C 570 365, 555 340, 555 315 C 555 290, 575 270, 600 270 C 625 270, 642 290, 642 315 C 642 328, 638 340, 632 345 C 632 345, 628 358, 625 365 Z" fill="white" className="doodle-path" />
      {/* Ear */}
      <path d="M 640 315 C 648 315, 652 322, 650 328 C 648 333, 642 332, 640 328" fill="white" className="doodle-path" />
      <path d="M 643 321 C 646 322, 646 325, 643 325" fill="none" className="doodle-thin" />

      {/* Face details */}
      {/* Eyes */}
      <circle cx="580" cy="305" r="3.5" className="doodle-fill" />
      <circle cx="612" cy="305" r="3.5" className="doodle-fill" />
      {/* Eyebrows */}
      <path d="M 572 297 C 576 294, 584 295, 586 298" fill="none" className="doodle-thin" />
      <path d="M 605 297 C 609 294, 617 295, 619 298" fill="none" className="doodle-thin" />
      {/* Nose */}
      <path d="M 590 312 C 596 322, 592 325, 597 325" fill="none" className="doodle-path" />
      {/* Smile */}
      <path d="M 588 338 C 595 344, 610 342, 615 336" fill="none" className="doodle-path" />

      {/* Hair (Wavy Doodle Cap) */}
      <path d="M 552 312 C 542 310, 532 292, 538 275 C 544 258, 558 245, 575 240 C 592 235, 625 245, 638 260 C 650 275, 650 295, 640 305 C 632 308, 628 300, 628 300 C 625 285, 612 278, 598 280 C 585 282, 580 295, 575 292 C 570 290, 565 305, 552 312 Z" className="doodle-fill" />

      {/* Left Arm & Hand (Holding CV) */}
      {/* Sleeve */}
      <path d="M 520 440 C 470 455, 450 495, 450 495" fill="none" className="doodle-path" />
      {/* Hand fingers */}
      <path d="M 390 498 C 388 505, 394 512, 400 512" fill="none" className="doodle-path" />
      <path d="M 380 488 C 378 495, 384 502, 390 502" fill="none" className="doodle-path" />
      <path d="M 375 478 C 372 484, 378 490, 385 490" fill="none" className="doodle-path" />
      <path d="M 375 468 C 372 473, 378 478, 385 478" fill="none" className="doodle-path" />
      <path d="M 380 458 C 385 458, 392 465, 390 472" fill="none" className="doodle-path" />

      {/* Right Arm & Hand (Typing) */}
      {/* Sleeve */}
      <path d="M 680 410 C 665 470, 635 500, 610 505" fill="none" className="doodle-path" />
      {/* Hand fingers on keyboard */}
      <path d="M 590 482 C 580 482, 570 486, 565 492 C 560 498, 560 505, 570 508 C 585 510, 605 505, 620 505" fill="none" className="doodle-path" />
      <path d="M 580 484 C 572 484, 564 488, 560 494" fill="none" className="doodle-path" />
      <path d="M 572 486 C 565 486, 558 490, 555 496" fill="none" className="doodle-path" />
      <path d="M 565 490 C 558 490, 552 494, 550 498" fill="none" className="doodle-path" />

      {/* ── 5. CV DOCUMENT ── */}
      {/* Rotated Board */}
      <path d="M 305 292 L 440 270 L 510 460 L 375 482 Z" fill="white" className="doodle-path" />
      {/* CV Header Text */}
      <path d="M 372 315 C 368 315, 363 318, 362 322 C 360 327, 363 332, 368 332" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
      <path d="M 384 314 L 398 336 L 412 312" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
      {/* User Icon Circle */}
      <circle cx="410" cy="365" r="15" className="doodle-path" />
      <circle cx="410" cy="362" r="5" className="doodle-fill" />
      <path d="M 398 375 C 400 370, 405 368, 410 368 C 415 368, 420 370, 422 375" fill="none" className="doodle-path" strokeWidth="2.5" />
      {/* Body Lines */}
      <path d="M 370 405 L 470 395" className="doodle-thin" />
      <path d="M 372 422 L 482 410" className="doodle-path" />
      <path d="M 380 438 L 460 430" className="doodle-thin" />
      <path d="M 382 455 L 490 442" className="doodle-path" />

      {/* ── 6. COFFEE MUG (RIGHT) ── */}
      <path d="M 685 455 L 750 455 L 750 510 C 750 516, 745 520, 735 520 L 700 520 C 690 520, 685 516, 685 510 Z" fill="white" className="doodle-path" />
      {/* Mug handle */}
      <path d="M 750 470 C 765 470, 775 476, 775 488 C 775 500, 765 505, 750 505" fill="none" className="doodle-path" />

      {/* ── 7. CLOUD UPLOAD & PROGRESS ── */}
      {/* Cloud Bubble */}
      <path d="M 230 140 C 230 115, 250 100, 275 100 C 285 100, 298 105, 305 112 C 312 98, 330 90, 350 90 C 375 90, 395 110, 395 135 C 395 140, 392 148, 390 152 C 402 152, 415 162, 415 178 C 415 195, 398 200, 385 200 L 235 200 C 215 200, 205 185, 205 172 C 205 158, 218 145, 230 140 Z" fill="white" className="doodle-path" />
      {/* Up Arrow */}
      <path d="M 310 240 L 310 160" className="doodle-path" strokeWidth="4" />
      <path d="M 285 185 L 310 160 L 335 185" fill="none" className="doodle-path" strokeWidth="4" />

      {/* Dotted arc representing upload flow */}
      <path d="M 252 245 C 220 295, 250 445, 335 480" fill="none" className="doodle-dash" />
      <circle cx="337" cy="481" r="5" className="doodle-fill" />

      {/* Checked Badge */}
      <circle cx="350" cy="325" r="28" className="doodle-fill" />
      <path d="M 334 323 L 345 335 L 368 312" fill="none" stroke="white" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />

      {/* Cloud Radiating Sparkles */}
      <path d="M 120 105 L 138 95" className="doodle-path" />
      <path d="M 122 75 L 140 75" className="doodle-path" />
      <path d="M 132 50 L 144 65" className="doodle-path" />
    </svg>
  );
}
