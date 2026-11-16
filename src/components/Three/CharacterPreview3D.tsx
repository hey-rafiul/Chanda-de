import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import {
  CustomizationItem,
  EquippedOutfit,
  HeroExpression,
  NPCArchetype,
} from '../../types/game';
import {
  CharacterAnimAction,
  StylizedCharacterRig,
  animateCharacterRig,
  createHeroCharacterFromEquipped,
  createNPCCharacter,
  disposeCharacterRig,
  setCharacterExpression,
} from '../../game/three/characterSystem';

interface CharacterPreview3DProps {
  mode: 'hero' | 'npc';
  archetype?: NPCArchetype;
  equipped?: EquippedOutfit;
  customizations?: CustomizationItem[];
  expression?: HeroExpression;
  action?: CharacterAnimAction;
  className?: string;
}

export const CharacterPreview3D: React.FC<CharacterPreview3DProps> = ({
  mode,
  archetype = 'tea_vendor',
  equipped,
  customizations,
  expression = 'neutral',
  action = 'idle',
  className = '',
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const rigRef = useRef<StylizedCharacterRig | null>(null);
  const yawRef = useRef(0.32);
  const actionRef = useRef<CharacterAnimAction>(action);
  const [webglFailed, setWebglFailed] = useState(false);

  actionRef.current = action;

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'low-power' });
    } catch {
      setWebglFailed(true);
      return;
    }

    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));

    const width = Math.max(120, el.clientWidth);
    const height = Math.max(160, el.clientHeight);
    renderer.setSize(width, height);
    el.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const pmrem = new THREE.PMREMGenerator(renderer);
    scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
    pmrem.dispose();

    const camera = new THREE.PerspectiveCamera(36, width / height, 0.1, 30);
    camera.position.set(0, 1.18, 3.6);
    camera.lookAt(0, 1.0, 0);

    const keyLight = new THREE.DirectionalLight(0xfff7ed, 2.0);
    keyLight.position.set(2.5, 4.0, 3.5);
    scene.add(keyLight);

    const rimLight = new THREE.DirectionalLight(0x93c5fd, 1.1);
    rimLight.position.set(-2.5, 2.5, -2.5);
    scene.add(rimLight);

    const hemi = new THREE.HemisphereLight(0xfefce8, 0x1e293b, 0.9);
    scene.add(hemi);

    // Subtle pedestal disc
    const discGeo = new THREE.CylinderGeometry(0.68, 0.74, 0.08, 28);
    const discMat = new THREE.MeshStandardMaterial({
      color: 0x1e293b,
      roughness: 0.4,
      metalness: 0.3,
    });
    const disc = new THREE.Mesh(discGeo, discMat);
    disc.position.y = -0.04;
    scene.add(disc);

    // Build character rig
    const rig =
      mode === 'hero' && equipped && customizations
        ? createHeroCharacterFromEquipped(equipped, customizations, false)
        : createNPCCharacter(archetype, { showMarkerArrow: false });
    if (mode === 'hero') {
      setCharacterExpression(rig, expression);
    }
    rig.root.rotation.y = yawRef.current;
    scene.add(rig.root);
    rigRef.current = rig;

    // Drag rotation interaction
    let dragging = false;
    let lastX = 0;

    const onPointerDown = (e: PointerEvent) => {
      dragging = true;
      lastX = e.clientX;
    };
    const onPointerMove = (e: PointerEvent) => {
      if (!dragging) return;
      const dx = e.clientX - lastX;
      lastX = e.clientX;
      yawRef.current += dx * 0.015;
    };
    const onPointerUp = () => {
      dragging = false;
    };

    const dom = renderer.domElement;
    dom.addEventListener('pointerdown', onPointerDown);
    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);

    const ro = new ResizeObserver(() => {
      if (!el) return;
      const nw = Math.max(120, el.clientWidth);
      const nh = Math.max(160, el.clientHeight);
      camera.aspect = nw / nh;
      camera.updateProjectionMatrix();
      renderer.setSize(nw, nh);
    });
    ro.observe(el);

    let rafId = 0;
    let disposed = false;
    const startMs = performance.now();

    const animate = () => {
      if (disposed) return;
      const t = (performance.now() - startMs) * 0.001;
      if (!dragging) {
        yawRef.current += 0.005;
      }
      if (rigRef.current) {
        rigRef.current.root.rotation.y = yawRef.current;
        animateCharacterRig(rigRef.current, {
          action: actionRef.current,
          phase: t * 1.8,
        });
      }
      renderer.render(scene, camera);
      rafId = requestAnimationFrame(animate);
    };
    animate();

    return () => {
      disposed = true;
      cancelAnimationFrame(rafId);
      ro.disconnect();
      dom.removeEventListener('pointerdown', onPointerDown);
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);

      disposeCharacterRig(rigRef.current);
      rigRef.current = null;
      discGeo.dispose();
      discMat.dispose();
      renderer.dispose();
      if (dom.parentElement) dom.parentElement.removeChild(dom);
    };
  }, [mode, archetype, equipped, customizations, expression]);

  if (webglFailed) {
    return (
      <div className={`flex items-center justify-center rounded-2xl bg-slate-900/90 border border-slate-700 text-slate-300 text-xs p-4 text-center ${className}`}>
        3D প্রিভিউ লোড হয়নি
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className={`relative rounded-2xl bg-gradient-to-b from-slate-900/90 via-indigo-950/60 to-slate-950 border border-slate-700/80 overflow-hidden cursor-grab active:cursor-grabbing ${className}`}
      title="ঘুরিয়ে দেখতে ড্র্যাগ করুন"
    >
      <div className="pointer-events-none absolute bottom-2 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded-md bg-slate-950/80 border border-slate-700/80 text-[10px] text-slate-300 whitespace-nowrap">
        ঘুরিয়ে দেখুন
      </div>
    </div>
  );
};
