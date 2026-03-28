import { useState, useEffect } from "react";
import {
  Box,
  Card,
  Typography,
  Grid,
  Button,
  TextField,
  CircularProgress,
  Chip,
  Avatar,
  Divider,
  Paper,
  IconButton,
  Tooltip,
} from "@mui/material";
import {
  AutoAwesomeRounded,
  SendRounded,
  ContentCopyRounded,
  EmailRounded,
  CampaignRounded,
  BarChartRounded,
  RefreshRounded,
} from "@mui/icons-material";
import { aiAPI, dashboardAPI } from "../../api/api";
import { useAuth } from "../../contexts/AuthContext";

const QUICK_PROMPTS = [
  {
    label: "Monthly Performance",
    prompt:
      "How did my business perform last month? Give me a summary with key metrics.",
    icon: <BarChartRounded />,
    color: "#2563EB",
  },
  {
    label: "Top Products",
    prompt:
      "Which products are selling best this month and what should I restock?",
    icon: <AutoAwesomeRounded />,
    color: "#7C3AED",
  },
  {
    label: "Business Tips",
    prompt:
      "Give me 5 actionable tips to increase revenue for my small business this quarter.",
    icon: <AutoAwesomeRounded />,
    color: "#10B981",
  },
  {
    label: "Expense Analysis",
    prompt: "Analyze my expenses and suggest where I can reduce costs.",
    icon: <BarChartRounded />,
    color: "#F59E0B",
  },
];

const EMAIL_TYPES = [
  { value: "followup", label: "Customer Follow-up" },
  { value: "complaint", label: "Complaint Response" },
  { value: "invoice", label: "Invoice Reminder" },
  { value: "thankyou", label: "Thank You Note" },
];

export default function AIInsightsPage() {
  const { user } = useAuth();
  const [businessData, setBusinessData] = useState({});
  const [activeTab, setActiveTab] = useState("insights");
  const [prompt, setPrompt] = useState("");
  const [response, setResponse] = useState("");
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const [emailType, setEmailType] = useState("followup");
  const [customerName, setCustomerName] = useState("");
  const [emailContext, setEmailContext] = useState("");
  const [generatedEmail, setGeneratedEmail] = useState("");
  const [emailLoading, setEmailLoading] = useState(false);

  const [postTopic, setPostTopic] = useState("");
  const [generatedPost, setGeneratedPost] = useState("");
  const [postLoading, setPostLoading] = useState(false);

  const [history, setHistory] = useState([]);

  useEffect(() => {
    if (!user?.businessId) return;
    dashboardAPI
      .getSummary(user.businessId)
      .then((r) => {
        if (r?.data) setBusinessData(r.data);
      })
      .catch(() => {});
  }, [user?.businessId]);

  const handleAsk = async () => {
    if (!prompt.trim()) return;
    setLoading(true);
    const q = prompt;
    setPrompt("");
    try {
      const res = await aiAPI.generateInsight(q, businessData);
      const answer =
        res.data?.content || res.data?.response || res.data?.result || "";
      if (!String(answer).trim()) {
        throw new Error("Empty AI response");
      }
      setResponse(answer);
      setHistory((h) => [{ q, a: answer, time: "Just now" }, ...h]);
    } catch {
      const answer =
        "AI service is currently unavailable. Please check backend/OpenAI configuration and try again.";
      setResponse(answer);
      setHistory((h) => [{ q, a: answer, time: "Just now" }, ...h]);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateEmail = async () => {
    setEmailLoading(true);
    try {
      const res = await aiAPI.generateEmail({
        type: emailType,
        customerName,
        context: emailContext,
      });
      const email = res.data?.email || res.data?.result || "";
      if (!String(email).trim()) {
        throw new Error("Empty AI response");
      }
      setGeneratedEmail(email);
    } catch {
      setGeneratedEmail(
        "AI email generation failed. Please check backend/OpenAI configuration and try again.",
      );
    } finally {
      setEmailLoading(false);
    }
  };

  const handleGeneratePost = async () => {
    setPostLoading(true);
    try {
      const res = await aiAPI.generateMarketingPost({ topic: postTopic });
      const post = res.data?.post || res.data?.result || "";
      if (!String(post).trim()) {
        throw new Error("Empty AI response");
      }
      setGeneratedPost(post);
    } catch {
      setGeneratedPost(
        "AI post generation failed. Please check backend/OpenAI configuration and try again.",
      );
    } finally {
      setPostLoading(false);
    }
  };

  const copy = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const TABS = [
    { key: "insights", label: "Business Insights", icon: <BarChartRounded /> },
    { key: "email", label: "Email Generator", icon: <EmailRounded /> },
    { key: "marketing", label: "Marketing Posts", icon: <CampaignRounded /> },
  ];

  return (
    <Box>
      <Box sx={{ mb: 3 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 0.5 }}>
          <Box
            sx={{
              width: 40,
              height: 40,
              borderRadius: "12px",
              background: "linear-gradient(135deg, #F59E0B, #EF4444)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <AutoAwesomeRounded sx={{ color: "#fff", fontSize: 22 }} />
          </Box>
          <Box>
            <Typography variant="h5" sx={{ fontWeight: 700 }}>
              AI Insights
            </Typography>
            <Typography variant="body2" sx={{ color: "#64748B" }}>
              Powered by OpenAI GPT-4o
            </Typography>
          </Box>
        </Box>
      </Box>

      <Box sx={{ display: "flex", gap: 1, mb: 3 }}>
        {TABS.map((tab) => (
          <Button
            key={tab.key}
            startIcon={tab.icon}
            variant={activeTab === tab.key ? "contained" : "outlined"}
            onClick={() => setActiveTab(tab.key)}
            sx={{
              borderRadius: "10px",
              ...(activeTab === tab.key
                ? {
                    background: "linear-gradient(135deg, #2563EB, #7C3AED)",
                    border: "none",
                  }
                : { borderColor: "#E2E8F0", color: "#64748B" }),
            }}
          >
            {tab.label}
          </Button>
        ))}
      </Box>

      {activeTab === "insights" && (
        <Grid container spacing={3}>
          <Grid item xs={12} md={8}>
            <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", mb: 2 }}>
              {QUICK_PROMPTS.map((qp) => (
                <Chip
                  key={qp.label}
                  icon={<Box sx={{ color: qp.color }}>{qp.icon}</Box>}
                  label={qp.label}
                  onClick={() => setPrompt(qp.prompt)}
                  sx={{
                    background: `${qp.color}10`,
                    color: qp.color,
                    border: `1px solid ${qp.color}30`,
                    fontWeight: 500,
                    cursor: "pointer",
                    "&:hover": { background: `${qp.color}20` },
                  }}
                />
              ))}
            </Box>

            <Card sx={{ mb: 3 }}>
              <Box
                sx={{ p: 2.5, display: "flex", gap: 2, alignItems: "flex-end" }}
              >
                <TextField
                  placeholder="Ask anything about your business... e.g. 'How did I perform last month?'"
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  onKeyDown={(e) =>
                    e.key === "Enter" && !e.shiftKey && handleAsk()
                  }
                  fullWidth
                  multiline
                  maxRows={3}
                  size="small"
                  sx={{ "& .MuiOutlinedInput-root": { borderRadius: "10px" } }}
                />
                <Button
                  variant="contained"
                  onClick={handleAsk}
                  disabled={loading || !prompt.trim()}
                  sx={{
                    background: "linear-gradient(135deg, #2563EB, #7C3AED)",
                    borderRadius: "10px",
                    px: 2.5,
                    py: 1.2,
                    minWidth: 50,
                  }}
                >
                  {loading ? (
                    <CircularProgress size={20} sx={{ color: "#fff" }} />
                  ) : (
                    <SendRounded />
                  )}
                </Button>
              </Box>
            </Card>

            {response && (
              <Card
                sx={{
                  mb: 3,
                  border: "1px solid #2563EB20",
                  background: "linear-gradient(135deg, #EFF6FF, #F5F3FF)",
                }}
              >
                <Box sx={{ p: 3 }}>
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      mb: 2,
                    }}
                  >
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <Avatar
                        sx={{
                          width: 28,
                          height: 28,
                          background:
                            "linear-gradient(135deg, #F59E0B, #EF4444)",
                        }}
                      >
                        <AutoAwesomeRounded sx={{ fontSize: 16 }} />
                      </Avatar>
                      <Typography
                        variant="body2"
                        sx={{ fontWeight: 600, color: "#2563EB" }}
                      >
                        AI Response
                      </Typography>
                    </Box>
                    <Tooltip title={copied ? "Copied!" : "Copy"}>
                      <IconButton size="small" onClick={() => copy(response)}>
                        <ContentCopyRounded
                          fontSize="small"
                          sx={{ color: "#64748B" }}
                        />
                      </IconButton>
                    </Tooltip>
                  </Box>
                  <Typography
                    variant="body2"
                    sx={{
                      whiteSpace: "pre-line",
                      color: "#1E293B",
                      lineHeight: 1.8,
                    }}
                  >
                    {response}
                  </Typography>
                </Box>
              </Card>
            )}
          </Grid>

          <Grid item xs={12} md={4}>
            <Card>
              <Box sx={{ p: 2.5, pb: 1 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                  Recent Chats
                </Typography>
              </Box>
              <Divider />
              <Box sx={{ maxHeight: 500, overflow: "auto" }}>
                {history.map((h, i) => (
                  <Box
                    key={i}
                    sx={{
                      p: 2,
                      "&:hover": { background: "#F8FAFC" },
                      cursor: "pointer",
                    }}
                    onClick={() => {
                      setResponse(h.a);
                    }}
                  >
                    <Typography
                      variant="body2"
                      sx={{
                        fontWeight: 600,
                        fontSize: "0.8rem",
                        mb: 0.5,
                        color: "#1E293B",
                      }}
                    >
                      {h.q}
                    </Typography>
                    <Typography
                      variant="caption"
                      sx={{
                        color: "#94A3B8",
                        display: "-webkit-box",
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: "vertical",
                        overflow: "hidden",
                      }}
                    >
                      {h.a.replace(/[*#]/g, "").substring(0, 80)}...
                    </Typography>
                    <Typography
                      variant="caption"
                      sx={{ color: "#CBD5E1", display: "block", mt: 0.5 }}
                    >
                      {h.time}
                    </Typography>
                    {i < history.length - 1 && <Divider sx={{ mt: 1 }} />}
                  </Box>
                ))}
              </Box>
            </Card>
          </Grid>
        </Grid>
      )}

      {activeTab === "email" && (
        <Grid container spacing={3}>
          <Grid item xs={12} md={5}>
            <Card sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 2.5 }}>
                Generate Email
              </Typography>
              <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                <Box>
                  <Typography
                    variant="body2"
                    sx={{ fontWeight: 500, mb: 1, color: "#64748B" }}
                  >
                    Email Type
                  </Typography>
                  <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
                    {EMAIL_TYPES.map((t) => (
                      <Chip
                        key={t.value}
                        label={t.label}
                        onClick={() => setEmailType(t.value)}
                        variant={emailType === t.value ? "filled" : "outlined"}
                        sx={
                          emailType === t.value
                            ? { background: "#2563EB", color: "#fff" }
                            : { borderColor: "#E2E8F0", color: "#64748B" }
                        }
                      />
                    ))}
                  </Box>
                </Box>
                <TextField
                  label="Customer Name"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  fullWidth
                  size="small"
                />
                <TextField
                  label="Context / Details"
                  value={emailContext}
                  onChange={(e) => setEmailContext(e.target.value)}
                  fullWidth
                  multiline
                  rows={3}
                  size="small"
                  placeholder="e.g. Customer ordered 2 phones, delivery delayed by 3 days..."
                />
                <Button
                  variant="contained"
                  onClick={handleGenerateEmail}
                  disabled={emailLoading}
                  startIcon={
                    emailLoading ? (
                      <CircularProgress size={16} sx={{ color: "#fff" }} />
                    ) : (
                      <AutoAwesomeRounded />
                    )
                  }
                  sx={{
                    background: "linear-gradient(135deg, #2563EB, #7C3AED)",
                    py: 1.3,
                  }}
                >
                  {emailLoading ? "Generating..." : "Generate Email"}
                </Button>
              </Box>
            </Card>
          </Grid>
          <Grid item xs={12} md={7}>
            <Card sx={{ p: 3, height: "100%" }}>
              <Box
                sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}
              >
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  Generated Email
                </Typography>
                {generatedEmail && (
                  <Tooltip title={copied ? "Copied!" : "Copy"}>
                    <IconButton
                      size="small"
                      onClick={() => copy(generatedEmail)}
                    >
                      <ContentCopyRounded
                        fontSize="small"
                        sx={{ color: "#64748B" }}
                      />
                    </IconButton>
                  </Tooltip>
                )}
              </Box>
              {generatedEmail ? (
                <Paper
                  variant="outlined"
                  sx={{
                    p: 2.5,
                    borderRadius: 2,
                    background: "#F8FAFC",
                    minHeight: 250,
                  }}
                >
                  <Typography
                    variant="body2"
                    sx={{
                      whiteSpace: "pre-line",
                      lineHeight: 1.9,
                      color: "#1E293B",
                    }}
                  >
                    {generatedEmail}
                  </Typography>
                </Paper>
              ) : (
                <Box
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    height: 250,
                    color: "#CBD5E1",
                  }}
                >
                  <EmailRounded sx={{ fontSize: 48, mb: 1 }} />
                  <Typography variant="body2">
                    Fill in the form and click Generate
                  </Typography>
                </Box>
              )}
            </Card>
          </Grid>
        </Grid>
      )}

      {activeTab === "marketing" && (
        <Grid container spacing={3}>
          <Grid item xs={12} md={5}>
            <Card sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 2.5 }}>
                Create Marketing Post
              </Typography>
              <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                <Typography variant="body2" sx={{ color: "#64748B" }}>
                  Quick Templates
                </Typography>
                <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
                  {[
                    "New Arrivals",
                    "Weekend Sale",
                    "Flash Offer",
                    "Product Launch",
                    "Customer Appreciation",
                  ].map((t) => (
                    <Chip
                      key={t}
                      label={t}
                      onClick={() => setPostTopic(t)}
                      variant="outlined"
                      sx={{
                        borderColor: "#E2E8F0",
                        color: "#64748B",
                        cursor: "pointer",
                        "&:hover": { background: "#F1F5F9" },
                      }}
                    />
                  ))}
                </Box>
                <TextField
                  label="Post Topic / Details"
                  value={postTopic}
                  onChange={(e) => setPostTopic(e.target.value)}
                  fullWidth
                  multiline
                  rows={3}
                  size="small"
                  placeholder="e.g. Write a Facebook post for our new Samsung phones arrival, 20% off this weekend only"
                />
                <Button
                  variant="contained"
                  onClick={handleGeneratePost}
                  disabled={postLoading || !postTopic.trim()}
                  startIcon={
                    postLoading ? (
                      <CircularProgress size={16} sx={{ color: "#fff" }} />
                    ) : (
                      <AutoAwesomeRounded />
                    )
                  }
                  sx={{
                    background: "linear-gradient(135deg, #F59E0B, #EF4444)",
                    py: 1.3,
                  }}
                >
                  {postLoading ? "Writing..." : "Write Post"}
                </Button>
              </Box>
            </Card>
          </Grid>
          <Grid item xs={12} md={7}>
            <Card sx={{ p: 3 }}>
              <Box
                sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}
              >
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  Generated Post
                </Typography>
                {generatedPost && (
                  <Box sx={{ display: "flex", gap: 1 }}>
                    <Tooltip title={copied ? "Copied!" : "Copy"}>
                      <IconButton
                        size="small"
                        onClick={() => copy(generatedPost)}
                      >
                        <ContentCopyRounded
                          fontSize="small"
                          sx={{ color: "#64748B" }}
                        />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Regenerate">
                      <IconButton size="small" onClick={handleGeneratePost}>
                        <RefreshRounded
                          fontSize="small"
                          sx={{ color: "#64748B" }}
                        />
                      </IconButton>
                    </Tooltip>
                  </Box>
                )}
              </Box>
              {generatedPost ? (
                <Paper
                  variant="outlined"
                  sx={{
                    p: 2.5,
                    borderRadius: 2,
                    background: "#FFF7ED",
                    border: "1px solid #FED7AA",
                    minHeight: 200,
                  }}
                >
                  <Typography
                    variant="body1"
                    sx={{
                      whiteSpace: "pre-line",
                      lineHeight: 2,
                      color: "#1E293B",
                    }}
                  >
                    {generatedPost}
                  </Typography>
                </Paper>
              ) : (
                <Box
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    height: 200,
                    color: "#CBD5E1",
                  }}
                >
                  <CampaignRounded sx={{ fontSize: 48, mb: 1 }} />
                  <Typography variant="body2">
                    Enter a topic and click Write Post
                  </Typography>
                </Box>
              )}
            </Card>
          </Grid>
        </Grid>
      )}
    </Box>
  );
}
