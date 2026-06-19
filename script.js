/* =============================================================
   SiriusRecords · 交互脚本
   ---------------------------------------------------------------
   - 导航：滚动后加深背景 + 移动端菜单切换
   - 邮箱一键复制
   - 投稿规范手风琴
   - 滚动入场动画 (IntersectionObserver)
   ============================================================= */

(function () {
  "use strict";

  /* ------------------------------------------------------------------
   * 1. 顶部导航滚动状态
   * ------------------------------------------------------------------ */
  const header = document.getElementById("siteHeader");
  const onScroll = () => {
    if (window.scrollY > 8) {
      header && header.classList.add("is-scrolled");
    } else {
      header && header.classList.remove("is-scrolled");
    }
  };

  // 使用 rAF 节流，避免滚动时频繁触发
  let ticking = false;
  window.addEventListener(
    "scroll",
    () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          onScroll();
          ticking = false;
        });
        ticking = true;
      }
    },
    { passive: true }
  );
  onScroll();

  /* ------------------------------------------------------------------
   * 2. 移动端导航菜单
   * ------------------------------------------------------------------ */
  const menuToggle = document.getElementById("menuToggle");
  const mobileNav = document.getElementById("mobileNav");

  if (menuToggle && mobileNav) {
    menuToggle.addEventListener("click", () => {
      const isOpen = menuToggle.getAttribute("aria-expanded") === "true";
      menuToggle.setAttribute("aria-expanded", String(!isOpen));
      mobileNav.classList.toggle("is-open", !isOpen);
      mobileNav.setAttribute("aria-hidden", String(isOpen));
    });

    // 点击链接后自动关闭
    mobileNav.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", () => {
        menuToggle.setAttribute("aria-expanded", "false");
        mobileNav.classList.remove("is-open");
        mobileNav.setAttribute("aria-hidden", "true");
      });
    });
  }

  /* ------------------------------------------------------------------
   * 3. 邮箱一键复制
   * ------------------------------------------------------------------ */
  const mailAddress = document.getElementById("mailAddress");
  const copyToast = document.getElementById("copyToast");

  if (mailAddress) {
    mailAddress.addEventListener("click", async (e) => {
      // 允许邮件链接的 href 仍会在新窗口打开邮件客户端；
      // 但我们也额外复制到剪贴板。
      const email = "2972444840@qq.com";
      try {
        if (navigator.clipboard && window.isSecureContext) {
          await navigator.clipboard.writeText(email);
        } else {
          // 回退方案
          const ta = document.createElement("textarea");
          ta.value = email;
          ta.style.position = "fixed";
          ta.style.opacity = "0";
          document.body.appendChild(ta);
          ta.select();
          document.execCommand("copy");
          document.body.removeChild(ta);
        }
        showToast();
      } catch (err) {
        // 静默失败 —— 复制出错时不打扰用户
        console.debug("copy failed", err);
      }
    });
  }

  let toastTimer = null;
  function showToast() {
    if (!copyToast) return;
    copyToast.classList.add("is-visible");
    if (toastTimer) clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
      copyToast.classList.remove("is-visible");
    }, 1800);
  }

  /* ------------------------------------------------------------------
   * 4. 投稿规范手风琴
   * ------------------------------------------------------------------ */
  const specTrigger = document.getElementById("specTrigger");
  const specPanel = document.getElementById("specPanel");

  if (specTrigger && specPanel) {
    specTrigger.addEventListener("click", () => {
      const expanded = specTrigger.getAttribute("aria-expanded") === "true";

      if (!expanded) {
        // 展开
        specPanel.hidden = false;
        // 先获取真实高度
        const height = specPanel.scrollHeight;
        specPanel.style.maxHeight = height + "px";
        specTrigger.setAttribute("aria-expanded", "true");
        specPanel.classList.add("is-open");

        // 动画结束后，释放高度限制，允许内容自适应
        const onEnd = () => {
          specPanel.style.maxHeight = "none";
          specPanel.removeEventListener("transitionend", onEnd);
        };
        specPanel.addEventListener("transitionend", onEnd);

        // 兜底：若 transitionend 没有触发（某些环境），800ms 后强制释放
        setTimeout(onEnd, 850);
      } else {
        // 收起：先固定当前高度，动画到 0
        specPanel.style.maxHeight = specPanel.scrollHeight + "px";
        // 触发一次 reflow 确保动画生效
        // eslint-disable-next-line no-unused-expressions
        specPanel.offsetHeight;
        specPanel.style.maxHeight = "0px";
        specTrigger.setAttribute("aria-expanded", "false");
        specPanel.classList.remove("is-open");

        const onEnd = () => {
          specPanel.hidden = true;
          specPanel.removeEventListener("transitionend", onEnd);
        };
        specPanel.addEventListener("transitionend", onEnd);
      }
    });
  }

  /* ------------------------------------------------------------------
   * 5. 通用滚动入场动画 (IntersectionObserver)
   * ------------------------------------------------------------------ */
  const revealTargets = document.querySelectorAll(
    ".hero-inner, .section-head, .release-card, .mail-card, .term-card, .accordion"
  );

  revealTargets.forEach((el) => el.classList.add("reveal"));

  if ("IntersectionObserver" in window) {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
    );

    revealTargets.forEach((el) => io.observe(el));
  } else {
    // 不支持时直接显示
    revealTargets.forEach((el) => el.classList.add("is-visible"));
  }
})();
