import { useEffect, useState } from "react";
import axios from "axios";
import {
  Avatar,
  Box,
  Typography,
  Chip,
  Link,
  List,
  ListItem,
  ListItemText,
  Paper,
} from "@mui/material";
import { useParams } from "react-router-dom";
import Loader from "../../components/common/Loader";
import API from "../../apiConfig";

const PublicStudentProfile = () => {
  const { id } = useParams();
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await axios.get(`${API}/students/getProfile/${id}`);
        setStudent(res.data);
      } catch (err) {
        console.error("Public profile fetch failed", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [id]);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" minHeight="100vh">
        <Loader />
      </Box>
    );
  }

  if (!student) {
    return <Typography textAlign="center">Profile not found</Typography>;
  }

  return (
    <Box
      sx={{
        minHeight: "100vh",
        py: 5,
        px: { xs: 2, sm: 4 },
        background: "linear-gradient(to bottom right, #f5f7fa, #e6ecf5)",
      }}
    >
      <Paper
        elevation={6}
        sx={{
          maxWidth: 950,
          mx: "auto",
          p: 4,
          borderRadius: 4,
        }}
      >
        {/* Header */}
        <Box display="flex" alignItems="center" gap={3} mb={4}>
          <Avatar
            src={student.profilePhoto}
            sx={{ width: 110, height: 110 }}
          />
          <Box>
            <Typography variant="h5" fontWeight="bold">
              {student.name}
            </Typography>
            <Typography color="text.secondary">{student.location}</Typography>
          </Box>
        </Box>

        {/* Sections */}
        {[
          {
            title: "Education",
            content: (
              <>
                <Typography fontWeight="medium">
                  {student.degree} - {student.branch}
                </Typography>
                <Typography color="text.secondary">
                  {student.college} ({student.graduationYear})
                </Typography>
              </>
            ),
          },
          {
            title: "Skills",
            content: (
              <Box display="flex" flexWrap="wrap" gap={1}>
                {student.skills?.map((skill, i) => (
                  <Chip key={i} label={skill} />
                ))}
              </Box>
            ),
          },
          {
            title: "About",
            content: (
              <Typography>
                {student.about || "No information provided."}
              </Typography>
            ),
          },
          {
            title: "Projects",
            content: student.projects?.length ? (
              <List>
                {student.projects.map((p, i) => (
                  <ListItem key={i}>
                    <ListItemText
                      primary={p.title}
                      secondary={
                        <>
                          <Typography variant="body2">
                            {p.description}
                          </Typography>
                          {p.githubLink && (
                            <Link href={p.githubLink} target="_blank">
                              GitHub
                            </Link>
                          )}
                        </>
                      }
                    />
                  </ListItem>
                ))}
              </List>
            ) : (
              <Typography>No projects</Typography>
            ),
          },
          {
            title: "Social Links",
            content: (
              <Box display="flex" gap={3}>
                {student.socialLinks?.linkedin && (
                  <Link href={student.socialLinks.linkedin} target="_blank">
                    LinkedIn
                  </Link>
                )}
                {student.socialLinks?.github && (
                  <Link href={student.socialLinks.github} target="_blank">
                    GitHub
                  </Link>
                )}
                {student.socialLinks?.portfolio && (
                  <Link href={student.socialLinks.portfolio} target="_blank">
                    Portfolio
                  </Link>
                )}
              </Box>
            ),
          },
        ].map((section, i) => (
          <Paper key={i} sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" mb={1} fontWeight="bold">
              {section.title}
            </Typography>
            {section.content}
          </Paper>
        ))}
      </Paper>
    </Box>
  );
};

export default PublicStudentProfile;
